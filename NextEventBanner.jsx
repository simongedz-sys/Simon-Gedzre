import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, X, MapPin, Clock, CalendarIcon, User, Volume2, VolumeX, Car, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Changed from 'react-hot-toast'
import RecurringEventManager from '../calendar/RecurringEventManager'; // New import

export default function NextEventBanner() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmMuted, setAlarmMuted] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [showRecurringManager, setShowRecurringManager] = useState(false); // New state
  const [minutesRemaining, setMinutesRemaining] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sentLateNotification, setSentLateNotification] = useState(false);
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const lastSpeechRef = useRef(null);
  const isSpeakingRef = useRef(false); // Track if currently speaking

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `What is the current temperature, today's high temperature, today's low temperature, and weather condition at coordinates ${position.coords.latitude}, ${position.coords.longitude}? Respond with JSON only.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            temperature: { type: "number" },
            high_temperature: { type: "number" },
            low_temperature: { type: "number" },
            condition: { type: "string" },
            emoji: { type: "string" }
          }
        }
      });
      return result;
    },
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: allEvents = [] } = useQuery({
    queryKey: ['allUpcomingEvents'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const [appointments, showings, openHouses, properties] = await Promise.all([
      base44.entities.Appointment.filter({ agent_id: user.id }).catch(() => []),
      base44.entities.Showing.filter({ showing_agent_id: user.id }).catch(() => []),
      base44.entities.OpenHouse.filter({ hosting_agent_id: user.id }).catch(() => []),
      Promise.all([
      base44.entities.Property.filter({ listing_agent_id: user.id }).catch(() => []),
      base44.entities.Property.filter({ created_by: user.email }).catch(() => [])]
      ).then((results) => {
        const combined = [...results[0], ...results[1]];
        return Array.from(new Map(combined.map((item) => [item.id, item])).values());
      })]
      );

      const now = new Date();

      // MODIFIED: Only show events for TODAY from 6:00 AM onwards, not tomorrow
      const today6AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Function to check for traffic delays
      const checkTrafficDelay = async (fromLat, fromLng, toLat, toLng) => {
        if (!fromLat || !fromLng || !toLat || !toLng) return null;

        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Check current traffic conditions from coordinates ${fromLat},${fromLng} to ${toLat},${toLng}. Are there any crashes, accidents, or severe traffic delays? Respond with JSON only.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                has_delay: { type: "boolean", description: "Whether there's a significant delay" },
                delay_minutes: { type: "number", description: "Additional minutes of delay due to traffic" },
                reason: { type: "string", description: "Reason for delay (e.g., crash, heavy traffic)" }
              },
              required: ["has_delay", "delay_minutes", "reason"]
            }
          });
          return result;
        } catch (e) {
          console.log('Could not check traffic:', e);
          return null;
        }
      };

      // If current time is before 6 AM, show events from 6 AM today
      // If current time is after 6 AM, show events from now
      const showEventsFrom = now < today6AM ? today6AM : now;

      // Don't show events beyond today - only TODAY's events
      const showEventsUntil = todayEnd;

      const showRecurringBeforeMinutes = user?.recurring_event_show_before_minutes || 0; // Changed from 60 to 0 - only show when event is NOW
      const recurringShowThreshold = new Date(now.getTime() + showRecurringBeforeMinutes * 60 * 1000);

      const generateRecurringInstances = (appointment) => {
        if (!appointment.is_recurring) return [];

        const instances = [];
        try {
          const startDate = new Date(appointment.scheduled_date);
          if (isNaN(startDate.getTime())) return [];
          
          const endDate = appointment.recurrence_end_date ?
            new Date(appointment.recurrence_end_date) :
            showEventsUntil;
          
          if (appointment.recurrence_end_date && isNaN(endDate.getTime())) return [];

          let currentDate = new Date(Math.max(startDate.getTime(), showEventsFrom.getTime()));

        // Get cancelled instances
        const cancelledInstances = appointment.cancelled_instances ?
        JSON.parse(appointment.cancelled_instances) :
        [];

        // Only process dates for TODAY
        while (currentDate <= endDate && currentDate <= showEventsUntil) {
          const dateString = format(currentDate, 'yyyy-MM-dd');

          // Skip if this instance was cancelled
          if (cancelledInstances.includes(dateString)) {
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day for check
            continue;
          }

          const eventDate = new Date(`${dateString}T${appointment.scheduled_time}`);
          if (isNaN(eventDate.getTime())) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }

          // For recurring events, only show if they're happening NOW (within showRecurringBeforeMinutes)
          // This prevents showing recurring events hours in advance
          const timeUntilEvent = eventDate - now;
          const minutesUntilEvent = Math.floor(timeUntilEvent / 1000 / 60);

          // Only include if event is within the threshold (default 0 means only show when happening)
          if (minutesUntilEvent >= -5 && minutesUntilEvent <= showRecurringBeforeMinutes && eventDate <= showEventsUntil) {
            let shouldInclude = true;

            if (appointment.recurrence_pattern === 'weekly' && appointment.recurrence_days) {
              const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
              const currentDayName = dayNames[currentDate.getDay()];
              const selectedDays = appointment.recurrence_days.split(',');
              shouldInclude = selectedDays.includes(currentDayName);
            }

            if (shouldInclude) {
              instances.push({
                ...appointment,
                type: 'appointment',
                datetime: eventDate,
                isToday: true,
                isRecurringInstance: true,
                instanceDate: dateString
              });
            }
          }

          if (appointment.recurrence_pattern === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
          } else if (appointment.recurrence_pattern === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 1);
          } else if (appointment.recurrence_pattern === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }

        } catch (e) {
          console.error('Error generating recurring instances:', e);
          return [];
        }
        return instances;
      };

      const mappedAppointments = appointments.
      filter((a) =>
      a.status !== 'cancelled' &&
      a.status !== 'completed' &&
      a.scheduled_date &&
      a.scheduled_time
      ).
      flatMap((a) => {
        if (a.is_recurring) {
          return generateRecurringInstances(a);
        } else {
          try {
            const eventDate = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
            if (isNaN(eventDate.getTime())) return [];
            // Only include if TODAY and within the time range
            if (eventDate >= showEventsFrom && eventDate <= showEventsUntil) {
              return [{
                ...a,
                type: 'appointment',
                datetime: eventDate,
                isToday: true
              }];
            }
            return [];
          } catch (e) {
            return [];
          }
        }
      });

      const mappedShowings = await Promise.all(showings.
      filter((s) =>
      s.status !== 'cancelled' &&
      s.status !== 'completed' &&
      s.scheduled_date &&
      s.scheduled_time
      ).
      map(async (s) => {
        try {
          const eventDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
          if (isNaN(eventDate.getTime())) return null;
          const property = properties.find((p) => p.id === s.property_id);

        let trafficDelay = null;
        if (user?.custom_from_lat && user?.custom_from_lng && property?.location_lat && property?.location_lng) {
          trafficDelay = await checkTrafficDelay(
            user.custom_from_lat,
            user.custom_from_lng,
            property.location_lat,
            property.location_lng
          );
        }

          return {
            ...s,
            type: 'showing',
            datetime: eventDate,
            isToday: eventDate >= today6AM && eventDate <= todayEnd,
            location_lat: property?.location_lat,
            location_lng: property?.location_lng,
            location_address: property?.address,
            trafficDelay
          };
        } catch (e) {
          return null;
        }
      })).
      then((results) => results.filter((s) => s && s.datetime >= showEventsFrom && s.datetime <= showEventsUntil));

      const mappedOpenHouses = await Promise.all(openHouses.
      filter((oh) =>
      oh.status !== 'cancelled' &&
      oh.status !== 'completed' &&
      oh.date &&
      oh.start_time
      ).
      map(async (oh) => {
        try {
          const eventDate = new Date(`${oh.date}T${oh.start_time}`);
          if (isNaN(eventDate.getTime())) return null;
          const property = properties.find((p) => p.id === oh.property_id);

        let trafficDelay = null;
        if (user?.custom_from_lat && user?.custom_from_lng && property?.location_lat && property?.location_lng) {
          trafficDelay = await checkTrafficDelay(
            user.custom_from_lat,
            user.custom_from_lng,
            property.location_lat,
            property.location_lng
          );
        }

          return {
            ...oh,
            type: 'openhouse',
            datetime: eventDate,
            isToday: eventDate >= today6AM && eventDate <= todayEnd,
            location_lat: property?.location_lat,
            location_lng: property?.location_lng,
            location_address: property?.address,
            trafficDelay
          };
        } catch (e) {
          return null;
        }
      })).
      then((results) => results.filter((oh) => oh && oh.datetime >= showEventsFrom && oh.datetime <= showEventsUntil));

      // Only return events for TODAY from 6 AM onwards (or from now if after 6 AM) and up to todayEnd
      return [...mappedAppointments, ...mappedShowings, ...mappedOpenHouses].
      filter((e) => e.datetime >= showEventsFrom && e.datetime <= showEventsUntil).
      sort((a, b) => a.datetime - b.datetime);
    },
    enabled: !!user,
    refetchInterval: 60000 // 1 minute instead of 30 seconds
  });

  const nextEvent = allEvents.length > 0 ? allEvents[0] : null;

  // Update countdown every second
  useEffect(() => {
    if (!nextEvent) {
      setMinutesRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const eventTime = nextEvent.datetime;
      const diffMs = eventTime - now;
      const diffMinutes = Math.floor(diffMs / 1000 / 60);
      setMinutesRemaining(diffMinutes);
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdownInterval);
  }, [nextEvent]);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Function to play sound using Web Audio API
  const playBeep = (frequency, duration, volume) => {
    if (!audioContextRef.current || alarmMuted) return;

    try {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.log('Error playing beep:', error);
    }
  };

  // Function to play alarm sound based on user preference
  const playAlarmSound = (volume) => {
    const alarmSound = user?.alarm_sound || 'beep';

    if (alarmMuted) return;

    switch (alarmSound) {
      case 'beep':
        playBeep(800, 0.2, volume);
        break;
      case 'chime':
        playBeep(523.25, 0.1, volume);
        setTimeout(() => playBeep(659.25, 0.1, volume), 100);
        setTimeout(() => playBeep(783.99, 0.2, volume), 200);
        break;
      case 'bell':
        playBeep(1046.5, 0.3, volume);
        setTimeout(() => playBeep(1318.51, 0.3, volume), 150);
        break;
      case 'alert':
        playBeep(1000, 0.1, volume);
        setTimeout(() => playBeep(800, 0.1, volume), 150);
        setTimeout(() => playBeep(1000, 0.1, volume), 300);
        break;
      case 'urgent':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => playBeep(1200, 0.1, volume), i * 150);
        }
        break;
      default:
        playBeep(800, 0.2, volume);
    }
  };

  // ENHANCED: More robust Text-to-Speech function with better interrupt handling
  const speakAlert = (text) => {
    if (alarmMuted) {
      console.log('🔇 Speech muted');
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported');
      return;
    }

    // Prevent overlapping speeches
    const now = Date.now();
    if (isSpeakingRef.current || lastSpeechRef.current && now - lastSpeechRef.current < 3000) {
      console.log('⏭️ Skipping speech (already speaking or too soon)');
      return;
    }

    try {
      console.log('🎤 Preparing to speak:', text);

      // Completely stop any ongoing speech
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;

      // Create the speech function
      const doSpeak = (retryCount = 0) => {
        if (alarmMuted || dismissed) {
          console.log('🔇 Speech cancelled (muted or dismissed)');
          return;
        }

        // Create a fresh utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          console.log('✅ Speech started');
          isSpeakingRef.current = true;
          lastSpeechRef.current = Date.now();
        };

        utterance.onend = () => {
          console.log('✅ Speech completed');
          isSpeakingRef.current = false;
        };

        utterance.onerror = (event) => {
          isSpeakingRef.current = false;

          // Interrupted and cancelled errors are expected, don't log them as errors
          if (event.error === 'interrupted' || event.error === 'cancelled') {
            console.log('🔇 Speech interrupted or cancelled (expected)');
            return;
          }

          // Log other errors
          if (event.error !== 'network') {
            console.warn('⚠️ Speech error:', event.error);
          }

          // Only retry once for network errors
          if (event.error === 'network' && retryCount < 1) {
            console.log('🔄 Retrying speech (attempt', retryCount + 1, ')...');
            setTimeout(() => {
              window.speechSynthesis.cancel();
              setTimeout(() => doSpeak(retryCount + 1), 500);
            }, 1000);
          }
        };

        // Speak immediately
        console.log('🚀 Speaking now...');
        window.speechSynthesis.speak(utterance);
      };

      // Wait for cancel to complete, then speak
      setTimeout(() => doSpeak(), 300);

    } catch (error) {
      console.error('❌ Error with speech synthesis:', error);
      isSpeakingRef.current = false;
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Alarm system - triggers 30 minutes before departure and at departure time
  useEffect(() => {
    // If dismissed, clear everything
    if (!nextEvent || !user || dismissed) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      setAlarmActive(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
      }
      return;
    }

    // If muted, stop alarm but keep checking
    if (alarmMuted) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      setAlarmActive(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
      }
    }

    const alarmEnabled = user.alarm_enabled !== false;
    if (!alarmEnabled) {
      console.log('⏰ Alarms disabled in user settings');
      return;
    }

    const agentFirstName = user?.full_name?.split(' ')[0] || 'Agent';
    const greeting = getGreeting();

    const checkAlarm = () => {
      const now = new Date();
      const eventTime = nextEvent.datetime;
      const officeLocation = {
        lat: user.custom_from_lat || user.office_lat,
        lng: user.custom_from_lng || user.office_lng
      };

      let travelTime = nextEvent.travel_time_minutes || 0;

      if (officeLocation.lat && officeLocation.lng &&
      nextEvent.location_lat && nextEvent.location_lng) {
        travelTime = nextEvent.travel_time_minutes || 30;
      }

      const departureTime = new Date(eventTime.getTime() - travelTime * 60 * 1000);
      const warningTime = new Date(departureTime.getTime() - 30 * 60 * 1000);
      const timeUntilDeparture = departureTime - now;
      const timeUntilWarning = warningTime - now;
      const minutesUntilDeparture = Math.floor(timeUntilDeparture / 1000 / 60);
      const minutesUntilWarning = Math.floor(timeUntilWarning / 1000 / 60);

      const eventTitle = nextEvent.title || (
      nextEvent.type === 'appointment' ? 'your appointment' :
      nextEvent.type === 'showing' ? 'your showing' :
      nextEvent.type === 'openhouse' ? 'your open house' : 'your event');

      console.log('⏰ Alarm Check:', {
        currentTime: format(now, 'HH:mm:ss'),
        eventTime: format(eventTime, 'HH:mm:ss'),
        departureTime: format(departureTime, 'HH:mm:ss'),
        minutesUntilWarning,
        minutesUntilDeparture,
        alarmMuted,
        alarmActive,
        dismissed,
        travelTime,
        greeting,
        agentFirstName,
        eventTitle
      });

      // 30-minute warning (gentle reminder)
      if (minutesUntilWarning <= 0 && minutesUntilWarning > -1 && !localStorage.getItem(`warned-${nextEvent.id || nextEvent.instanceDate}`)) {
        console.log('🔔 30-MINUTE WARNING TRIGGERED!');
        if (!alarmMuted) {
          localStorage.setItem(`warned-${nextEvent.id || nextEvent.instanceDate}`, 'true');
          playAlarmSound(0.3);
          const message = `${greeting} ${agentFirstName}, reminder: You need to leave for ${eventTitle} in 30 minutes`;
          console.log('🗣️ Speaking 30-min warning:', message);
          speakAlert(message);
        } else {
          console.log('🔇 30-min warning muted');
        }
      }

      // Departure time alarm (escalating)
      if (minutesUntilDeparture <= 0 && minutesUntilDeparture > -5) {
        console.log('🚨 DEPARTURE TIME - ALARM SHOULD TRIGGER NOW!');
        if (!alarmActive && !alarmMuted) {
          console.log('✅ Starting escalating alarm...');
          setAlarmActive(true);
          playEscalatingAlarm(agentFirstName, eventTitle, greeting);
        } else {
          console.log('⚠️ Alarm not triggered:', { alarmActive, alarmMuted });
        }
      } else {
        if (alarmActive) {
          console.log('⏹️ Stopping alarm (outside departure window)');
          setAlarmActive(false);
          if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
          }
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isSpeakingRef.current = false;
          }
        }
      }

      // Running late notification (5+ minutes past departure)
      if (minutesUntilDeparture <= -5 && minutesUntilDeparture > -10 && !sentLateNotification) {
        console.log('🚗 RUNNING LATE - Sending notification');
        sendRunningLateNotification();
      }
    };

    checkAlarm();
    intervalRef.current = setInterval(checkAlarm, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
      }
    };
  }, [nextEvent, user, dismissed, alarmMuted, alarmActive]);

  const playEscalatingAlarm = (agentName, eventTitle, greeting) => {
    console.log('🚀 playEscalatingAlarm called:', { agentName, eventTitle, greeting, alarmMuted });

    if (alarmMuted) {
      console.log('🔇 Escalating alarm muted, exiting');
      return;
    }

    let playCount = 0;
    const maxPlays = 20;
    let volume = 0.3;

    const message = `${greeting} ${agentName}, time to leave for ${eventTitle}. You need to depart now.`;
    console.log('🗣️ DEPARTURE VOICE MESSAGE:', message);
    speakAlert(message);

    const playAlarm = () => {
      if (playCount >= maxPlays || alarmMuted || dismissed) {
        console.log('⏹️ Stopping alarm:', { playCount, alarmMuted, dismissed });
        if (alarmIntervalRef.current) {
          clearInterval(alarmIntervalRef.current);
          alarmIntervalRef.current = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          isSpeakingRef.current = false;
        }
        setAlarmActive(false);
        return;
      }

      console.log(`🔊 Playing alarm sound #${playCount + 1}, volume: ${volume.toFixed(2)}`);
      playAlarmSound(Math.min(volume, 1.0));

      if (playCount % 5 === 0 && playCount > 0) {
        const repeatMessage = `${agentName}, time to leave now`;
        console.log('🗣️ Speaking (repeat):', repeatMessage);
        speakAlert(repeatMessage);
      }

      playCount++;
      volume += 0.05;
    };

    playAlarm();
    alarmIntervalRef.current = setInterval(playAlarm, 3000);
  };

  const handleMuteAlarm = () => {
    setAlarmMuted((prev) => {
      const newMutedState = !prev;
      if (newMutedState) {
        setAlarmActive(false);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          isSpeakingRef.current = false;
        }
        if (alarmIntervalRef.current) {
          clearInterval(alarmIntervalRef.current);
          alarmIntervalRef.current = null;
        }
      }
      return newMutedState;
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    setAlarmMuted(true);
    setAlarmActive(false);
    setSentLateNotification(false);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (nextEvent) {
      localStorage.removeItem(`warned-${nextEvent.id || nextEvent.instanceDate}`);
      // Set dismiss for this session (until page reload)
      sessionStorage.setItem('eventBannerDismissed', 'true');
    }
  };

  const handleLeavingNow = () => {
    setDismissed(true);
    setAlarmMuted(true);
    setAlarmActive(false);
    setSentLateNotification(false);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (nextEvent) {
      // Store the current event ID to not show until next event
      localStorage.setItem('dismissedEventId', nextEvent.id || nextEvent.instanceDate || '');
      localStorage.removeItem(`warned-${nextEvent.id || nextEvent.instanceDate}`);
    }
  };

  const sendRunningLateNotification = async () => {
    setSentLateNotification(true);

    try {
      const eventTitle = nextEvent.title || (
      nextEvent.type === 'appointment' ? 'your appointment' :
      nextEvent.type === 'showing' ? 'your showing' :
      nextEvent.type === 'openhouse' ? 'your open house' : 'your event');

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        title: '🚗 Running Late Alert',
        message: `You're running late for ${eventTitle} at ${format(nextEvent.datetime, 'h:mm a')}`,
        notification_type: 'system_alert',
        priority: 'urgent',
        related_entity_type: nextEvent.type === 'appointment' ? 'appointment' :
        nextEvent.type === 'showing' ? 'showing' : 'open_house',
        related_entity_id: nextEvent.id
      });

      toast.error(`Running late for ${eventTitle}!`, {
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => navigate(getEventLink())
        }
      });

      // Voice alert
      if (!alarmMuted) {
        speakAlert(`You are running late for ${eventTitle}. Please depart immediately.`);
      }
    } catch (error) {
      console.error('Error sending late notification:', error);
    }
  };

  // Check if dismissed for this session
  const sessionDismissed = sessionStorage.getItem('eventBannerDismissed') === 'true';

  // Check if this specific event was dismissed with "Leaving Now"
  const dismissedEventId = localStorage.getItem('dismissedEventId');
  const isCurrentEventDismissed = dismissedEventId && dismissedEventId === (nextEvent?.id || nextEvent?.instanceDate || '');

  if (!nextEvent || dismissed || sessionDismissed || isCurrentEventDismissed) return null;

  const now = new Date();
  const eventTime = nextEvent.datetime;
  const officeLocation = {
    lat: user?.custom_from_lat || user?.office_lat,
    lng: user?.custom_from_lng || user?.office_lng
  };

  let travelTime = nextEvent.travel_time_minutes || 0;
  if (officeLocation.lat && officeLocation.lng && nextEvent.location_lat && nextEvent.location_lng) {
    travelTime = nextEvent.travel_time_minutes || 30;
  }

  const departureTime = new Date(eventTime.getTime() - travelTime * 60 * 1000);
  const warningTime = new Date(departureTime.getTime() - 30 * 60 * 1000);
  const timeUntilEvent = eventTime - now;
  const timeUntilDeparture = departureTime - now;
  const timeUntilWarning = warningTime - now;
  const minutesUntilDeparture = Math.floor(timeUntilDeparture / 1000 / 60);
  const minutesUntilWarning = Math.floor(timeUntilWarning / 1000 / 60);

  const isTimeToLeave = minutesUntilDeparture <= 0 && minutesUntilDeparture > -5;
  const isWarningTime = minutesUntilWarning <= 0 && minutesUntilWarning > -30;
  const isUrgent = minutesUntilDeparture <= 15;

  // Calculate progress bar values (show 1 hour before meeting)
  const showProgressBar = minutesRemaining !== null && minutesRemaining <= 60 && minutesRemaining > 0;
  const progressPercentage = showProgressBar ? (60 - minutesRemaining) / 60 * 100 : 0;

  // Color based on time remaining
  const getProgressColor = () => {
    if (minutesRemaining === null) return '';
    if (minutesRemaining > 45) return 'bg-green-500';
    if (minutesRemaining > 30) return 'bg-yellow-500';
    if (minutesRemaining > 15) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEventTitle = () => {
    if (nextEvent.type === 'appointment') return nextEvent.title || 'Appointment';
    if (nextEvent.type === 'showing') return `Showing${nextEvent.property_id ? ' at Property' : ''}`;
    if (nextEvent.type === 'openhouse') return 'Open House';
    return 'Event';
  };

  const getEventLink = () => {
    if (nextEvent.type === 'appointment') return createPageUrl('Calendar');
    if (nextEvent.type === 'showing') return createPageUrl('Showings');
    if (nextEvent.type === 'openhouse') return createPageUrl('OpenHouses');
    return createPageUrl('Calendar');
  };

  // Get agent first name and greeting
  const agentFirstName = user?.full_name?.split(' ')[0] || 'Agent';
  const greeting = getGreeting();
  const eventTitle = getEventTitle();

  // Format time remaining with hours and minutes
  const formatTimeRemaining = (totalMinutes) => {
    if (totalMinutes === null || totalMinutes < 0) return null;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Test voice function
  const testVoice = () => {
    playAlarmSound(0.5); // Use playAlarmSound which respects alarmMuted
    setTimeout(() => {
      if (!alarmMuted) {// Only speak if not muted
        speakAlert(`${greeting} ${agentFirstName}, this is a test of your voice alert system for ${eventTitle}`);
      }
    }, 500);
  };

  return (
    <>
            <div className={`
                w-full rounded-xl transition-all duration-300 shadow-sm overflow-hidden
                ${alarmActive ? 'bg-red-600 text-white animate-pulse' :
      isTimeToLeave ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' :
      isWarningTime ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' :
      isUrgent ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800' :
      'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'}
            `}>
                {/* Progress Bar */}
                {showProgressBar && !alarmActive &&
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700">
                        <div
            className={`h-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }} />

                    </div>
        }
                <div className="">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Icon + Event Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Icon with progress ring */}
                            <div className="relative flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                alarmActive ? 'bg-white/20' :
                isTimeToLeave ? 'bg-red-100 dark:bg-red-900/50' :
                isWarningTime ? 'bg-orange-100 dark:bg-orange-900/50' :
                isUrgent ? 'bg-amber-100 dark:bg-amber-900/50' :
                'bg-blue-100 dark:bg-blue-900/50'}`
                }>
                                    {alarmActive ?
                  <Bell className="w-5 h-5 text-white animate-bounce" /> :

                  <CalendarIcon className={`w-5 h-5 ${
                  isTimeToLeave ? 'text-red-600 dark:text-red-400' :
                  isWarningTime ? 'text-orange-600 dark:text-orange-400' :
                  isUrgent ? 'text-amber-600 dark:text-amber-400' :
                  'text-blue-600 dark:text-blue-400'}`
                  } />
                  }
                                </div>
                                {/* Mini progress indicator */}
                                {showProgressBar && !alarmActive &&
                <svg className="absolute -top-0.5 -left-0.5 w-11 h-11 -rotate-90">
                                        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-slate-200 dark:text-slate-700" />
                                        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3"
                  strokeDasharray={`${progressPercentage * 1.13} 113`}
                  className={getProgressColor().replace('bg-', 'text-')} />
                                    </svg>
                }
                            </div>
                            
                            {/* Event details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                    to={getEventLink()}
                    className={`font-semibold text-sm hover:underline truncate ${
                    alarmActive ? 'text-white' :
                    isTimeToLeave ? 'text-red-900 dark:text-red-100' :
                    isWarningTime ? 'text-orange-900 dark:text-orange-100' :
                    isUrgent ? 'text-amber-900 dark:text-amber-100' :
                    'text-slate-900 dark:text-slate-100'}`
                    }>

                                        {alarmActive ? `🚨 TIME TO LEAVE!` : eventTitle}
                                    </Link>
                                    {nextEvent.isRecurringInstance && !alarmActive &&
                  <button
                    onClick={(e) => {e.preventDefault();setShowRecurringManager(true);}}
                    className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full hover:bg-purple-200 transition-colors">

                                            <RefreshCw className="w-2.5 h-2.5 inline mr-0.5" />Recurring
                                        </button>
                  }
                                </div>
                                <div className={`flex items-center gap-3 text-xs mt-0.5 ${
                alarmActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`
                }>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {format(eventTime, 'h:mm a')}
                                    </span>
                                    {nextEvent.location_address &&
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                                            <MapPin className="w-3 h-3" />
                                            {nextEvent.location_address}
                                        </span>
                  }
                                    {travelTime > 0 &&
                  <>
                                            <span className="flex items-center gap-1">
                                                <Car className="w-3 h-3" />
                                                {travelTime}m
                                            </span>
                                            <span className={`flex items-center gap-1 font-semibold ${
                    alarmActive ? 'text-yellow-300' :
                    isTimeToLeave ? 'text-red-700 dark:text-red-300' :
                    isWarningTime ? 'text-orange-700 dark:text-orange-300' :
                    'text-purple-600 dark:text-purple-400'}`
                    }>
                                                • Leave {format(departureTime, 'h:mm a')}
                                            </span>
                                        </>
                  }
                                </div>
                            </div>
                        </div>

                        {/* Right: Time remaining + Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Countdown badge */}
                            {!alarmActive && minutesRemaining !== null && minutesRemaining > 0 &&
              <div className={`text-center px-3 py-1 rounded-lg ${
              isTimeToLeave ? 'bg-red-100 dark:bg-red-900/50' :
              isWarningTime ? 'bg-orange-100 dark:bg-orange-900/50' :
              isUrgent ? 'bg-amber-100 dark:bg-amber-900/50' :
              'bg-blue-100 dark:bg-blue-900/50'}`
              }>
                                    <p className={`text-lg font-bold leading-none ${
                isTimeToLeave ? 'text-red-700 dark:text-red-300' :
                isWarningTime ? 'text-orange-700 dark:text-orange-300' :
                isUrgent ? 'text-amber-700 dark:text-amber-300' :
                'text-blue-700 dark:text-blue-300'}`
                }>{formatTimeRemaining(minutesRemaining)}</p>
                                    <p className={`text-[10px] ${
                isTimeToLeave ? 'text-red-600 dark:text-red-400' :
                isWarningTime ? 'text-orange-600 dark:text-orange-400' :
                isUrgent ? 'text-amber-600 dark:text-amber-400' :
                'text-blue-600 dark:text-blue-400'}`
                }>until event</p>
                                </div>
              }

                            {/* Traffic alert - compact */}
                            {nextEvent.trafficDelay?.has_delay &&
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-[10px]">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    +{nextEvent.trafficDelay.delay_minutes}m traffic
                                </Badge>
              }

                            {/* Action buttons - compact */}
                            <div className="flex items-center gap-1">
                                <Button
                  onClick={handleLeavingNow}
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 text-xs ${alarmActive ? 'text-white hover:bg-white/20' : 'hover:bg-green-100 dark:hover:bg-green-900/30'}`}>

                                    <Car className="w-3 h-3 mr-1" />
                                    Leaving
                                </Button>
                                <Button
                  onClick={handleMuteAlarm}
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 ${alarmActive ? 'text-white hover:bg-white/20' : ''}`}>

                                    {alarmMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                                <Button
                  onClick={handleDismiss}
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 ${alarmActive ? 'text-white hover:bg-white/20' : ''}`}>

                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Running Late Modal */}
            {showLateModal &&
      <Dialog open={showLateModal} onOpenChange={setShowLateModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send "Running Late" Notification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                This feature is configured in Settings → Communication.
                            </p>
                            <p className="text-sm">
                                Would you like to go to settings to configure your late notification templates?
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowLateModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => {
              setShowLateModal(false);
              window.location.href = createPageUrl('Settings') + '?tab=communication';
            }}>
                                Go to Settings
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
      }

            {/* Recurring Event Manager */}
            {showRecurringManager && nextEvent &&
      <RecurringEventManager
        appointment={nextEvent}
        onClose={() => setShowRecurringManager(false)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['allUpcomingEvents'] });
          setDismissed(true); // Dismiss the current banner to force re-render/re-evaluation
        }}
        onEditFull={(apt) => {
          setShowRecurringManager(false);
          navigate(createPageUrl('Calendar') + `?editAppointment=${apt.id}`);
        }} />

      }
        </>);

}