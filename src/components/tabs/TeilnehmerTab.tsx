import { useState, useEffect } from 'react';
import type { Teilnehmer } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Users, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function TeilnehmerTab() {
  const [items, setItems] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teilnehmer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', telefon: '', geburtsdatum: '' });

  const load = () => {
    setLoading(true);
    LivingAppsService.getTeilnehmer().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', telefon: '', geburtsdatum: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Teilnehmer) => {
    setEditing(item);
    setForm({
      name: item.fields.name || '',
      email: item.fields.email || '',
      telefon: item.fields.telefon || '',
      geburtsdatum: item.fields.geburtsdatum || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fields = {
        name: form.name,
        email: form.email || undefined,
        telefon: form.telefon || undefined,
        geburtsdatum: form.geburtsdatum || undefined,
      };
      if (editing) {
        await LivingAppsService.updateTeilnehmerEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await LivingAppsService.deleteTeilnehmerEntry(deleteId);
    setDeleteId(null);
    load();
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Teilnehmer</h2>
          <p className="text-sm" style={{ color: 'hsl(237 10% 48%)' }}>{items.length} Einträge</p>
        </div>
        <Button onClick={openNew} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)', boxShadow: 'var(--shadow-elegant)' }} className="gap-2">
          <Plus size={16} /> Teilnehmer hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Laden...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'hsl(237 10% 55%)' }}>
          <Users size={40} strokeWidth={1.5} />
          <p className="font-medium">Noch keine Teilnehmer eingetragen</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(237 15% 88%)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(237 20% 97%)', borderBottom: '1px solid hsl(237 15% 88%)' }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Name</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>E-Mail</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Telefon</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Geburtsdatum</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.record_id} className="table-row-hover" style={{ borderTop: i > 0 ? '1px solid hsl(237 15% 92%)' : undefined, background: 'hsl(0 0% 100%)' }}>
                  <td className="px-5 py-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'hsl(167 58% 88%)', color: 'hsl(167 58% 22%)' }}>
                        {(item.fields.name || '?')[0].toUpperCase()}
                      </div>
                      {item.fields.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'hsl(237 10% 45%)' }}>
                    {item.fields.email ? <span className="flex items-center gap-1.5"><Mail size={13} />{item.fields.email}</span> : '—'}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'hsl(237 10% 45%)' }}>
                    {item.fields.telefon ? <span className="flex items-center gap-1.5"><Phone size={13} />{item.fields.telefon}</span> : '—'}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'hsl(237 10% 45%)' }}>
                    {item.fields.geburtsdatum ? <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(item.fields.geburtsdatum)}</span> : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-8 w-8 p-0"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.record_id)} className="h-8 w-8 p-0" style={{ color: 'hsl(0 72% 51%)' }}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Max Mustermann" />
            </div>
            <div className="grid gap-1.5">
              <Label>E-Mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="max@beispiel.de" />
            </div>
            <div className="grid gap-1.5">
              <Label>Telefon</Label>
              <Input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} placeholder="+49 123 456789" />
            </div>
            <div className="grid gap-1.5">
              <Label>Geburtsdatum</Label>
              <Input type="date" value={form.geburtsdatum} onChange={e => setForm(f => ({ ...f, geburtsdatum: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)' }}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Teilnehmer löschen"
        description="Sind Sie sicher? Dieser Teilnehmer wird dauerhaft gelöscht."
        onConfirm={handleDelete}
      />
    </div>
  );
}
