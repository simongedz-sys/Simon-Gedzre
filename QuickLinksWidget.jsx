import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Plus, X, Edit2, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QuickLinksWidget({ user }) {
  const [links, setLinks] = useState(() => {
    try {
      return JSON.parse(user?.quick_links || '[]');
    } catch {
      return [];
    }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '' });

  const saveLinks = async (newLinks) => {
    try {
      await base44.auth.updateMe({ quick_links: JSON.stringify(newLinks) });
      setLinks(newLinks);
      toast.success('Links saved!');
    } catch (error) {
      toast.error('Failed to save links');
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.url) {
      toast.error('Please fill in all fields');
      return;
    }

    let url = formData.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newLinks = editingLink !== null
      ? links.map((link, idx) => idx === editingLink ? { ...formData, url } : link)
      : [...links, { ...formData, url }];

    saveLinks(newLinks);
    setShowAddModal(false);
    setFormData({ name: '', url: '' });
    setEditingLink(null);
  };

  const handleEdit = (index) => {
    setEditingLink(index);
    setFormData(links[index]);
    setShowAddModal(true);
  };

  const handleDelete = (index) => {
    const newLinks = links.filter((_, idx) => idx !== index);
    saveLinks(newLinks);
  };

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg dark:shadow-2xl h-full">
        <CardHeader className="py-4 px-5">
          <CardTitle className="flex items-center justify-between text-lg font-bold text-slate-800 dark:text-white">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Quick Links
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingLink(null);
                setFormData({ name: '', url: '' });
                setShowAddModal(true);
              }}
              className="h-7 w-7 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {links.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No quick links yet</p>
              <p className="text-xs mt-1">Add your frequently used sites</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="group relative bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:shadow-md transition-all"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {link.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{link.url}</p>
                  </a>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(idx);
                      }}
                      className="p-1 bg-white dark:bg-slate-600 rounded shadow-sm hover:bg-slate-100"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(idx);
                      }}
                      className="p-1 bg-white dark:bg-slate-600 rounded shadow-sm hover:bg-red-50"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLink !== null ? 'Edit Link' : 'Add Quick Link'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Zillow, MLS, etc."
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="zillow.com or https://zillow.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAddModal(false);
                setEditingLink(null);
                setFormData({ name: '', url: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                {editingLink !== null ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}