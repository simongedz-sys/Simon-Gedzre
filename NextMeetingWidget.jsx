import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Briefcase, Navigation, Car, Clock, Loader2, AlertCircle, Edit2, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Fix for default icon issue in Leaflet with bundlers like Webpack
const officeIcon = new L.DivIcon({
  html: `<div class="p-1 bg-gray-700 rounded-full ring-4 ring-gray-500/30 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const meetingIcon = new L.DivIcon({
  html: `<div class="p-1 bg-primary rounded-full ring-4 ring-primary/30"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 22]
});

const currentLocationIcon = new L.DivIcon({
  html: `<div class="p-2 bg-blue-500 rounded-full ring-4 ring-blue-400/50 animate-pulse"><svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [80, 80] });
    }
  }, [map, bounds]);
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [map, lat, lng]);
  return null;
};

export default function NextMeetingWidget({ appointments = [], showings = [], openHouses = [], properties = [], currentUser, sharedNextMeeting }) {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isEditingFromAddress, setIsEditingFromAddress] = useState(false);
  const [customFromInput, setCustomFromInput] = useState('');

  const queryClient = useQueryClient();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current GPS location (now always active if available, not just mobile)
  useEffect(() => {
    if ('geolocation' in navigator) { 
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          // Only log permission denied, ignore timeout and other errors
          if (error.code === error.PERMISSION_DENIED) {
            console.log('Location permission denied'); // Changed from console.debug to console.log
            setLocationError('Location access denied');
          } else {
            // Silently handle timeout and other errors by not setting an error state
            // console.warn('Geolocation error:', error.message);
            setLocationError(null); 
          }
        },
        {
          enableHighAccuracy: false, // Changed to false for better battery life and quicker fix
          timeout: 30000, // Increased to 30 seconds to avoid frequent timeout errors
          maximumAge: 600000 // Accept location up to 10 minutes old
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update custom from address mutation
  const updateFromAddressMutation = useMutation({
    mutationFn: async (address) => {
      if (!address || address.trim() === '') {
        // Clear custom address
        await base44.auth.updateMe({
          custom_from_address: null,
          custom_from_lat: null,
          custom_from_lng: null
        });
        return null;
      }

      // Geocode the address
      try {
        const geocoded = await base44.integrations.Core.InvokeLLM({
          prompt: `Using Google Maps' geocoding, what is the precise latitude and longitude for the following address: "${address}"? Respond ONLY with a JSON object.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: { "lat": { "type": "number" }, "lng": { "type": "number" } },
            required: ["lat", "lng"]
          }
        });

        if (geocoded && typeof geocoded.lat === 'number' && typeof geocoded.lng === 'number') {
          await base44.auth.updateMe({
            custom_from_address: address,
            custom_from_lat: geocoded.lat,
            custom_from_lng: geocoded.lng
          });
          return { address, ...geocoded };
        }
        throw new Error("Could not geocode address");
      } catch (e) {
        throw new Error("Failed to geocode address. Please check the address and try again.");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (data) {
        toast.success("From address saved!");
      } else {
        toast.success("From address cleared!");
      }
      setIsEditingFromAddress(false);
      setCustomFromInput('');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save address");
    }
  });

  const handleSaveFromAddress = () => {
    updateFromAddressMutation.mutate(customFromInput);
  };

  const handleClearFromAddress = () => {
    updateFromAddressMutation.mutate('');
  };

  // Determine the "from" location priority: current GPS > custom address > office (for calculation)
  const fromLocation = useMemo(() => {
    // Priority 1: Current GPS location (most accurate real-time location)
    if (currentLocation) {
      return { ...currentLocation, type: 'gps', address: 'Your Current Location' };
    }
    // Priority 2: User-defined custom location
    if (currentUser?.custom_from_address && typeof currentUser?.custom_from_lat === 'number' && typeof currentUser?.custom_from_lng === 'number') {
      return {
        lat: currentUser.custom_from_lat,
        lng: currentUser.custom_from_lng,
        address: currentUser.custom_from_address,
        type: 'custom'
      };
    }
    // Priority 3: Falls back to officeLocation (handled separately)
    return null;
  }, [currentUser, currentLocation]);

  const { data: officeLocation, error: officeError, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['officeLocationGeocode', currentUser?.default_office_location, currentUser?.company_office_address, currentUser?.private_office_address],
    queryFn: async () => {
        // Check which office location is the default
        const usePrivate = currentUser?.default_office_location === 'private';
        
        let address;
        
        if (usePrivate) {
            address = currentUser?.private_office_address;
        } else {
            address = currentUser?.company_office_address;
        }

        // If no address, throw error
        if (!address) {
            throw new Error("No office address set in your profile.");
        }
        
        // Use Nominatim OpenStreetMap geocoding API (free, no key needed)
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`, {
            headers: {
                'User-Agent': 'RealtyMind/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error("Geocoding service unavailable");
        }
        
        const results = await response.json();
        
        if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            return { lat, lng, address, isPrivate: usePrivate };
        }
        
        throw new Error("Could not find coordinates for this address.");
    },
    enabled: !!currentUser && (!!currentUser.company_office_address || !!currentUser.private_office_address),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 1,
  });

  // Calculate next meeting locally - use state to persist the value
  const [persistedNextMeeting, setPersistedNextMeeting] = useState(null);
  
  const calculatedNextMeeting = useMemo(() => {
      if (!appointments || !showings || !openHouses || !properties) return null;
      
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      
      const allEvents = [
          ...appointments.map(a => {
              try {
                  const eventDate = parseISO(`${a.scheduled_date}T${a.scheduled_time || '00:00:00'}`);
                  if (isNaN(eventDate.getTime())) return null;
                  return {
                      ...a,
                      eventType: 'Appointment',
                      eventDate,
                  };
              } catch (e) {
                  return null;
              }
          }).filter(Boolean),
          ...showings.map(s => {
              try {
                  const property = properties.find(p => p.id === s.property_id);
                  const eventDate = parseISO(`${s.scheduled_date}T${s.scheduled_time || '00:00:00'}`);
                  if (isNaN(eventDate.getTime())) return null;
                  return {
                      ...s,
                      eventType: 'Showing',
                      title: `Showing: ${property?.address || 'Property Viewing'}`,
                      eventDate,
                      location_lat: property?.location_lat,
                      location_lng: property?.location_lng,
                      location_address: property?.address,
                      scheduled_date: s.scheduled_date,
                      scheduled_time: s.scheduled_time,
                  };
              } catch (e) {
                  return null;
              }
          }).filter(Boolean),
          ...openHouses.map(oh => {
              try {
                  const property = properties.find(p => p.id === oh.property_id);
                  const eventDate = parseISO(`${oh.date}T${oh.start_time || '00:00:00'}`);
                  if (isNaN(eventDate.getTime())) return null;
                  return {
                      ...oh,
                      eventType: 'Open House',
                      title: `Open House: ${property?.address || 'Property Viewing'}`,
                      eventDate,
                      scheduled_date: oh.date,
                      scheduled_time: oh.start_time,
                      location_lat: property?.location_lat,
                      location_lng: property?.location_lng,
                      location_address: property?.address,
                  };
              } catch (e) {
                  return null;
              }
          }).filter(Boolean),
      ];

      return allEvents
          .filter(e => {
              return e.eventDate >= now && 
                     e.eventDate >= todayStart && 
                     e.eventDate <= todayEnd &&
                     ((e.location_lat && e.location_lng) || e.location_address);
          })
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
          [0];
  }, [appointments, showings, openHouses, properties]);

  // Use sharedNextMeeting from Dashboard if provided, otherwise use calculated
  const nextMeeting = sharedNextMeeting || calculatedNextMeeting;
  
  // Persist the meeting to avoid flickering when data refetches
  useEffect(() => {
    if (nextMeeting) {
      setPersistedNextMeeting(nextMeeting);
    }
  }, [nextMeeting]);
  
  // Use persisted meeting if current is null (data refetching)
  const displayMeeting = nextMeeting || persistedNextMeeting;

  // Geocode meeting location if only address is available
  const { data: meetingLocation, isLoading: isLoadingMeetingLocation } = useQuery({
    queryKey: ['meetingLocationGeocode', displayMeeting?.id, displayMeeting?.location_address],
    queryFn: async () => {
        // If we have coordinates already, use them
        if (displayMeeting?.location_lat && displayMeeting?.location_lng) {
            return {
                lat: displayMeeting.location_lat,
                lng: displayMeeting.location_lng,
                address: displayMeeting.location_address
            };
        }

        if (!displayMeeting?.location_address) {
            return null;
        }

        // Use Base44 InvokeLLM for more reliable geocoding
        try {
            const geocoded = await base44.integrations.Core.InvokeLLM({
                prompt: `Using Google Maps' geocoding, what is the precise latitude and longitude for the following address: "${displayMeeting.location_address}"? Respond ONLY with a JSON object.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: { "lat": { "type": "number" }, "lng": { "type": "number" } },
                    required: ["lat", "lng"]
                }
            });
    
            if (geocoded && typeof geocoded.lat === 'number' && typeof geocoded.lng === 'number') {
                return { lat: geocoded.lat, lng: geocoded.lng, address: displayMeeting.location_address };
            }
            return null;
        } catch (e) {
            console.error("Geocoding failed:", e);
            return null;
        }
    },
    enabled: !!displayMeeting && (!!displayMeeting.location_address || (!!displayMeeting.location_lat && !!displayMeeting.location_lng)),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Calculate straight-line distance - always return something if we have meeting location
  const estimatedDistance = useMemo(() => {
    const startPoint = fromLocation || officeLocation;
    
    // If we have coordinates for both points, calculate precise distance
    if (startPoint?.lat && startPoint?.lng && meetingLocation?.lat && meetingLocation?.lng) {
      const toRadians = (deg) => deg * (Math.PI / 180);
      const R = 6371; // Earth's radius in km
      const dLat = toRadians(meetingLocation.lat - startPoint.lat);
      const dLon = toRadians(meetingLocation.lng - startPoint.lng);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(startPoint.lat)) * Math.cos(toRadians(meetingLocation.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      // Estimate driving time: distance * 1.3 (road factor) / 60 km/h average speed in city
      const estimatedTime = (distance * 1.3) / 60 * 60;
      
      return {
        distance_km: distance.toFixed(1),
        estimated_minutes: Math.round(estimatedTime),
        isPrecise: true
      };
    }
    
    // Fallback: if we have meeting location but no start coordinates yet, show approximate
    if (meetingLocation?.lat && meetingLocation?.lng) {
      // Return a reasonable estimate while waiting for start location
      return {
        distance_km: '15-20',
        estimated_minutes: 25,
        isPrecise: false,
        isLoading: true
      };
    }
    
    return null;
  }, [fromLocation, officeLocation, meetingLocation]);

  const { data: liveTravelTime, isLoading: isLoadingTravelTime, isFetching: isFetchingTravelTime, error: travelTimeError } = useQuery({
    queryKey: ['liveTravelTime', fromLocation?.lat, fromLocation?.lng, officeLocation?.lat, officeLocation?.lng, meetingLocation?.lat, meetingLocation?.lng, 'dashboard-widget'],
    queryFn: async () => {
        // Use fromLocation (custom or GPS) if available, otherwise use office
        const startPoint = fromLocation || officeLocation;
        if (!startPoint || !meetingLocation?.lat || !meetingLocation?.lng) {
            return null;
        }
        
        // Use address for better results
        let startLocation = '';
        let destinationLocation = '';
        
        if (fromLocation?.type === 'gps') {
          startLocation = `${startPoint.lat}, ${startPoint.lng}`;
        } else if (startPoint.address) {
          startLocation = startPoint.address;
        } else {
          startLocation = `${startPoint.lat}, ${startPoint.lng}`;
        }
        
        if (displayMeeting.location_address) {
          destinationLocation = displayMeeting.location_address;
        } else {
          destinationLocation = `${meetingLocation.lat}, ${meetingLocation.lng}`;
        }
        
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Using Google Maps Directions API with CURRENT REAL-TIME TRAFFIC, calculate the driving time and distance:

Start: ${startLocation}
Destination: ${destinationLocation}

CRITICAL REQUIREMENTS:
- Use ACTUAL ROAD ROUTES (highways, streets) - NOT straight line
- Include CURRENT TRAFFIC CONDITIONS (check live traffic now)
- Account for traffic lights, turns, speed limits
- Return REALISTIC driving time a car would take RIGHT NOW

Respond ONLY with JSON: {"travel_time_minutes": number, "distance_km": number}`,
                response_json_schema: {
                    type: "object",
                    properties: { 
                        "travel_time_minutes": { "type": "number" },
                        "distance_km": { "type": "number" }
                    },
                    required: ["travel_time_minutes", "distance_km"]
                },
                add_context_from_internet: true
            });
            
            // Store in localStorage so NextEventBanner can access it
            if (result?.travel_time_minutes && displayMeeting?.id) {
                localStorage.setItem('sharedTravelTime', JSON.stringify({
                    travel_time_minutes: result.travel_time_minutes,
                    distance_km: result.distance_km,
                    timestamp: Date.now(),
                    meetingId: displayMeeting.id
                }));
            }
            
            return result;
        } catch (e) {
            console.error("Failed to fetch live travel time:", e);
            throw e; // Throw to trigger error state
        }
    },
    enabled: !!displayMeeting && !!meetingLocation?.lat && !!meetingLocation?.lng && (!!officeLocation || !!fromLocation),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000, // Reduce to 2 minutes for fresher traffic data
    retry: 2,
  });

  const canShowMap = useMemo(() => {
    return displayMeeting && meetingLocation && meetingLocation.lat && meetingLocation.lng;
  }, [displayMeeting, meetingLocation]);

  const mapBounds = useMemo(() => {
    if (canShowMap) {
      // Use fromLocation if available, otherwise office
      const startPoint = fromLocation || officeLocation;
      if (startPoint) {
        return L.latLngBounds([
          [startPoint.lat, startPoint.lng],
          [meetingLocation.lat, meetingLocation.lng]
        ]);
      }
    }
    return null;
  }, [officeLocation, fromLocation, meetingLocation, canShowMap]);

  const routeLine = useMemo(() => {
    if (!canShowMap) return null;
    const startPoint = fromLocation || officeLocation;
    if (!startPoint || typeof startPoint.lat !== 'number' || typeof startPoint.lng !== 'number') return null;
    
    return [
      [startPoint.lat, startPoint.lng],
      [meetingLocation.lat, meetingLocation.lng]
    ];
  }, [officeLocation, fromLocation, meetingLocation, canShowMap]);

  const handleGetDirections = () => {
    if (!displayMeeting) return;
    
    // Always prefer address string for Google Maps (more reliable)
    const destination = displayMeeting.location_address 
        ? encodeURIComponent(nextMeeting.location_address)
        : (meetingLocation?.lat && meetingLocation?.lng)
            ? `${meetingLocation.lat},${meetingLocation.lng}`
            : '';
    
    let origin = '';
    // Use fromLocation if available, otherwise office
    const startPoint = fromLocation || officeLocation;
    if (startPoint) {
      // For custom addresses, prioritize using the actual address string over coordinates
      if (startPoint.type === 'custom' && startPoint.address) {
        origin = encodeURIComponent(startPoint.address);
      } 
      // For GPS location, use coordinates for real-time accuracy
      else if (startPoint.type === 'gps') {
        origin = `${startPoint.lat},${startPoint.lng}`;
      }
      // For office, use address if available, otherwise coordinates
      else if (startPoint.address) {
        origin = encodeURIComponent(startPoint.address);
      } else if (typeof startPoint.lat === 'number' && typeof startPoint.lng === 'number') {
        origin = `${startPoint.lat},${startPoint.lng}`;
      }
    }
    
    const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(url, '_blank');
  };

  // Calculate car position percentage based on actual GPS location
  const carPositionPercentage = useMemo(() => {
    // Default to starting point (0%) if no GPS location available
    if (!currentLocation || !meetingLocation?.lat || !meetingLocation?.lng) return 0;
    
    // Start point is the fromLocation or office (where you theoretically started from)
    const startPoint = fromLocation || officeLocation;
    if (!startPoint || typeof startPoint.lat !== 'number' || typeof startPoint.lng !== 'number') return 0;
    
    // Calculate distances using Haversine formula (approximate)
    const toRadians = (deg) => deg * (Math.PI / 180);
    
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    // Distance from current GPS location to the START point
    const distanceToStart = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      startPoint.lat, 
      startPoint.lng
    );
    
    // Distance from current GPS location to the DESTINATION
    const distanceToDestination = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      meetingLocation.lat, 
      meetingLocation.lng
    );
    
    // Total distance from start to destination
    const totalDistance = calculateDistance(
      startPoint.lat, 
      startPoint.lng, 
      meetingLocation.lat, 
      meetingLocation.lng
    );
    
    // If current location is very close to the start point (within 1 km), show 0%
    if (distanceToStart < 1.0) {
      return 0;
    }
    
    // If current location is very close to the destination (within 1 km), show 100%
    if (distanceToDestination < 1.0) {
      return 100;
    }
    
    // If total distance is very small, default to 0%
    if (totalDistance < 0.1) {
      return 0;
    }
    
    // Calculate progress based on the relationship:
    // We want: Progress = how much of the journey is complete
    // If distanceToStart is small and distanceToDestination is large = near start = low %
    // If distanceToStart is large and distanceToDestination is small = near destination = high %
    
    // Simple formula: what percentage of total distance have we covered from start?
    const distanceCovered = totalDistance - distanceToDestination;
    let percentage = (distanceCovered / totalDistance) * 100;
    
    // If the GPS location doesn't make sense (off route significantly), default to 0%
    // This happens when distanceToStart + distanceToDestination >> totalDistance
    const routeDeviation = (distanceToStart + distanceToDestination) / totalDistance;
    if (routeDeviation > 1.5) {
      // Too far off route, likely haven't started journey yet
      return 0;
    }

    // Ensure between 0 and 100
    return Math.max(0, Math.min(Math.round(percentage), 100));
  }, [currentLocation, fromLocation, officeLocation, meetingLocation]);

  return (
    <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
          <Briefcase className="w-4 h-4 text-cyan-500" />
          {displayMeeting ? 'Next Meeting Travel' : 'Your Current Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col" style={{ minHeight: '300px' }}>
        {!displayMeeting ? (
          <div className="flex flex-col h-full">
            <div className="flex-grow relative">
                {!currentLocation && !officeLocation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 flex-col gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">Finding your location...</p>
                    </div>
                )}
                 {locationError && !currentLocation && !officeLocation && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/50 z-10 text-center p-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Location Unavailable</p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">{locationError}</p>
                    </div>
                )}
                {currentLocation ? (
                    <MapContainer
                        key={`current-${currentLocation.lat}-${currentLocation.lng}`}
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%', borderRadius: '0 0 0.5rem 0.5rem' }}
                        scrollWheelZoom={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
                            <Popup>Your Current Location</Popup>
                        </Marker>
                        <RecenterMap lat={currentLocation.lat} lng={currentLocation.lng} />
                    </MapContainer>
                ) : officeLocation && (
                    <MapContainer
                        key={`office-${officeLocation.lat}-${officeLocation.lng}`}
                        center={[officeLocation.lat, officeLocation.lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%', borderRadius: '0 0 0.5rem 0.5rem' }}
                        scrollWheelZoom={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={[officeLocation.lat, officeLocation.lng]} icon={officeIcon}>
                            <Popup>{officeLocation.address}</Popup>
                        </Marker>
                        <RecenterMap lat={officeLocation.lat} lng={officeLocation.lng} />
                    </MapContainer>
                )}
            </div>
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                 <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No Upcoming Meetings</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentLocation ? 'Showing your current location' : (officeLocation?.isPrivate ? 'Private Office' : 'Company Office') + ': ' + (officeLocation?.address || 'Your schedule is clear for now.')}
                 </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-3 pt-2 pb-1 border-b border-slate-200/50 dark:border-slate-700/50 space-y-1">
                {/* Title and location on one line */}
                <div className="flex items-start gap-1.5">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex-1 line-clamp-1">{displayMeeting.title}</p>
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{displayMeeting.scheduled_time}</span>
                </div>
                
                {/* Location - compact */}
                {displayMeeting.location_address && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                        {displayMeeting.location_address}
                    </p>
                )}
                
                {/* Travel time - compact inline */}
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-slate-400" />
                        {(isLoadingTravelTime || isFetchingTravelTime) ? (
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        ) : liveTravelTime?.travel_time_minutes ? (
                            <span className="font-semibold text-primary">
                                {Math.round(liveTravelTime.travel_time_minutes)}m • {liveTravelTime.distance_km?.toFixed(1)}km
                            </span>
                        ) : estimatedDistance?.isPrecise ? (
                            <span className="text-slate-500">~{estimatedDistance.estimated_minutes}m</span>
                        ) : (
                            <span className="text-slate-400">...</span>
                        )}
                    </div>
                    
                    {/* Depart time */}
                    {liveTravelTime?.travel_time_minutes && displayMeeting.scheduled_time && (
                        <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                                Leave {(() => {
                                    const [hours, minutes] = displayMeeting.scheduled_time.split(':').map(Number);
                                    const meetingTime = new Date();
                                    meetingTime.setHours(hours, minutes, 0, 0);
                                    meetingTime.setMinutes(meetingTime.getMinutes() - Math.round(liveTravelTime.travel_time_minutes));
                                    return format(meetingTime, 'h:mm a');
                                })()}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* From location - compact */}
                {!isEditingFromAddress ? (
                  <div className="flex items-center gap-1 group">
                    {fromLocation?.type === 'custom' ? (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 flex-1 truncate">From: {fromLocation.address}</p>
                    ) : fromLocation?.type === 'gps' ? (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 flex-1">From: Current Location</p>
                    ) : officeLocation ? (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex-1">From: Office</p>
                    ) : null}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 opacity-0 group-hover:opacity-100"
                      onClick={() => setIsEditingFromAddress(true)}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </Button>
                    {fromLocation?.type === 'custom' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 text-red-500"
                          onClick={handleClearFromAddress}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Input 
                      placeholder="From address..."
                      value={customFromInput}
                      onChange={(e) => setCustomFromInput(e.target.value)}
                      className="h-5 text-[10px] flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFromAddress();
                        if (e.key === 'Escape') {
                          setIsEditingFromAddress(false);
                          setCustomFromInput('');
                        }
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={handleSaveFromAddress}
                      disabled={updateFromAddressMutation.isLoading || !customFromInput.trim()}
                    >
                      {updateFromAddressMutation.isLoading ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Check className="w-2.5 h-2.5" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => {
                        setIsEditingFromAddress(false);
                        setCustomFromInput('');
                      }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                )}
            </div>
            
            {currentLocation && (fromLocation || officeLocation) && meetingLocation && (
                <div className="relative bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 px-3 py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <div className="text-sm">🏢</div>
                        <div className="flex-1 relative h-5 flex items-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center">
                                <div 
                                    className="h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${carPositionPercentage}%` }}
                                ></div>
                            </div>
                            <div 
                                className="absolute text-sm transition-all duration-1000" 
                                style={{ 
                                    left: `${carPositionPercentage}%`, 
                                    transform: 'translateX(-50%)',
                                    animation: carPositionPercentage > 0 && carPositionPercentage < 100 ? 'bounce 2s infinite' : 'none'
                                }}
                            >
                                🚗
                            </div>
                        </div>
                        <MapPin className="w-3 h-3 text-primary" />
                    </div>
                </div>
            )}

            <div className="flex-grow relative">
               {isLoadingMeetingLocation && !canShowMap && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 gap-2">
                       <Loader2 className="w-6 h-6 animate-spin text-primary" />
                       <p className="text-xs text-slate-600 dark:text-slate-400">Loading map...</p>
                   </div>
               )}
               {canShowMap ? (
                 <>
                    {officeError && !fromLocation && (
                       <div className="absolute top-2 left-2 right-2 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg p-2 z-10">
                           <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                           <p className="text-[10px] text-amber-700 dark:text-amber-300">Set office address in settings for better routes</p>
                       </div>
                   )}
                   <MapContainer
                       center={[meetingLocation.lat, meetingLocation.lng]}
                       zoom={12}
                       style={{ height: '100%', width: '100%', minHeight: '180px', borderRadius: '0 0 0.5rem 0.5rem' }}
                       scrollWheelZoom={false}
                       attributionControl={false}
                   >
                       <TileLayer
                           url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                       />
                       {routeLine && (
                           <Polyline 
                               positions={routeLine} 
                               color="#3b82f6" 
                               weight={3}
                               dashArray="10, 10"
                               opacity={0.6}
                           />
                       )}
                       <Marker position={[meetingLocation.lat, meetingLocation.lng]} icon={meetingIcon}>
                           <Popup>{meetingLocation.address || displayMeeting.title}</Popup>
                       </Marker>
                       {currentLocation && (
                           <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
                               <Popup>Your Current Location</Popup>
                           </Marker>
                       )}
                       {fromLocation?.type === 'custom' ? (
                           <Marker position={[fromLocation.lat, fromLocation.lng]} icon={officeIcon}>
                               <Popup>From: {fromLocation.address}</Popup>
                           </Marker>
                       ) : !currentLocation && officeLocation && (
                            <Marker position={[officeLocation.lat, officeLocation.lng]} icon={officeIcon}>
                               <Popup>Your Office: {officeLocation.address}</Popup>
                           </Marker>
                       )}
                       {mapBounds && <FitBounds bounds={mapBounds} />}
                   </MapContainer>
                 </>
               ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <MapPin className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">Geocoding address...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-4">{displayMeeting.location_address || "Loading..."}</p>
                </div>
               )}
            </div>
             <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button onClick={handleGetDirections} size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Get Directions <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}