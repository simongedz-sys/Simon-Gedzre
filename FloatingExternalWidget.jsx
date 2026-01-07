import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, Settings, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FloatingExternalWidget({ user, isEmbedded = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [config, setConfig] = useState({
    url: '',
    title: 'External Widget'
  });
  const [tempUrl, setTempUrl] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [iframeError, setIframeError] = useState(false);
  const widgetRef = useRef(null);

  // Load saved config from user data
  useEffect(() => {
    if (user?.external_widget_config) {
      try {
        const savedConfig = JSON.parse(user.external_widget_config);
        setConfig(savedConfig.config || { url: '', title: 'External Widget' });
        setPosition(savedConfig.position || { x: 100, y: 100 });
        setSize(savedConfig.size || { width: 400, height: 300 });
        setIsVisible(savedConfig.isVisible || false);
      } catch (e) {
        console.error('Error loading widget config:', e);
      }
    }
  }, [user]);

  // Save config to user data
  const saveConfig = async (newConfig, newPosition, newSize, visible) => {
    try {
      await base44.auth.updateMe({
        external_widget_config: JSON.stringify({
          config: newConfig,
          position: newPosition,
          size: newSize,
          isVisible: visible
        })
      });
    } catch (error) {
      console.error('Error saving widget config:', error);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({ x: newX, y: newY });
    }
    if (isResizing) {
      const newWidth = Math.max(300, e.clientX - position.x);
      const newHeight = Math.max(200, e.clientY - position.y);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      saveConfig(config, position, size, isVisible);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position]);

  const handleSaveSettings = async () => {
    const newConfig = { url: tempUrl, title: tempTitle };
    setConfig(newConfig);
    setIframeError(false);
    await saveConfig(newConfig, position, size, isVisible);
    setShowSettings(false);
    toast.success('Widget settings saved!');
  };

  const handleClose = async () => {
    setIsVisible(false);
    await saveConfig(config, position, size, false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Embedded mode: always show inline
  if (isEmbedded) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex-none">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              {config.title || 'External Widget'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setTempUrl(config.url);
                setTempTitle(config.title);
                setShowSettings(true);
              }}
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {config.url ? (
            iframeError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-amber-50 dark:bg-amber-900/20">
                <div className="max-w-sm">
                  <X className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">Can't Embed This Site</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {config.url.includes('google.com') || config.url.includes('gmail') 
                      ? 'Gmail blocks iframe embedding for security.'
                      : 'This site doesn\'t allow iframe embedding.'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => window.open(config.url, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTempUrl('');
                        setTempTitle('External Widget');
                        setShowSettings(true);
                        setIframeError(false);
                      }}
                    >
                      Try Different Site
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={config.url}
                className="w-full h-full border-0"
                title={config.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onError={() => setIframeError(true)}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6 text-slate-500">
              <div>
                <p className="mb-2">No URL configured</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setTempUrl('');
                    setTempTitle('External Widget');
                    setShowSettings(true);
                  }}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Widget Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="e.g., Traffic Cam, Home Camera"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-url">External URL</Label>
                <Input
                  id="widget-url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <p className="text-xs text-slate-500">
                  Enter any URL. Note: Gmail, Facebook, and some sites block iframe embedding.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Floating mode
  if (!isVisible) {
    return (
      <Button
        onClick={() => {
          setIsVisible(true);
          saveConfig(config, position, size, true);
        }}
        className="fixed bottom-4 left-4 z-50 shadow-lg"
        size="sm"
      >
        <GripVertical className="w-4 h-4 mr-2" />
        Show Widget
      </Button>
    );
  }

  return (
    <>
      <div
        ref={widgetRef}
        className="fixed z-[9999] shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMinimized ? 'auto' : `${size.width}px`,
          height: isMinimized ? 'auto' : `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing p-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex-none">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                {config.title || 'External Widget'}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempUrl(config.url);
                    setTempTitle(config.title);
                    setShowSettings(true);
                  }}
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMinimize();
                  }}
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-0 flex-1 overflow-hidden relative">
                {config.url ? (
                  iframeError ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-amber-50 dark:bg-amber-900/20">
                      <div className="max-w-sm">
                        <X className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">Can't Embed This Site</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {config.url.includes('google.com') || config.url.includes('gmail') 
                            ? 'Gmail blocks iframe embedding for security.'
                            : 'This site doesn\'t allow iframe embedding.'}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => window.open(config.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Open in New Tab
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTempUrl('');
                              setTempTitle('External Widget');
                              setShowSettings(true);
                              setIframeError(false);
                            }}
                          >
                            Try Different Site
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={config.url}
                      className="w-full h-full border-0"
                      title={config.title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      onError={() => setIframeError(true)}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-6 text-slate-500">
                    <div>
                      <p className="mb-2">No URL configured</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTempUrl('');
                          setTempTitle('External Widget');
                          setShowSettings(true);
                        }}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-slate-300 hover:bg-slate-400"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              />
            </>
          )}
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="e.g., Traffic Cam, Home Camera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-url">External URL</Label>
              <Input
                id="widget-url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-slate-500">
                Enter any URL (camera feed, traffic map, weather widget, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}