import { useState, useEffect } from 'react';
import type { Dozenten } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, GraduationCap, Mail, Phone, BookOpen } from 'lucide-react';

export function DozentenTab() {
  const [items, setItems] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dozenten | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', telefon: '', fachgebiet: '' });

  const load = () => {
    setLoading(true);
    LivingAppsService.getDozenten().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', telefon: '', fachgebiet: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Dozenten) => {
    setEditing(item);
    setForm({
      name: item.fields.name || '',
      email: item.fields.email || '',
      telefon: item.fields.telefon || '',
      fachgebiet: item.fields.fachgebiet || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await LivingAppsService.updateDozentenEntry(editing.record_id, form);
      } else {
        await LivingAppsService.createDozentenEntry(form);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await LivingAppsService.deleteDozentenEntry(deleteId);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Dozenten</h2>
          <p className="text-sm" style={{ color: 'hsl(237 10% 48%)' }}>{items.length} Einträge</p>
        </div>
        <Button onClick={openNew} className="btn-primary gap-2" style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)', boxShadow: 'var(--shadow-elegant)' }}>
          <Plus size={16} /> Dozent hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Laden...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'hsl(237 10% 55%)' }}>
          <GraduationCap size={40} strokeWidth={1.5} />
          <p className="font-medium">Noch keine Dozenten eingetragen</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(237 15% 88%)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(237 20% 97%)', borderBottom: '1px solid hsl(237 15% 88%)' }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Name</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>E-Mail</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Telefon</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Fachgebiet</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.record_id}
                  className="table-row-hover"
                  style={{ borderTop: i > 0 ? '1px solid hsl(237 15% 92%)' : undefined, background: 'hsl(0 0% 100%)' }}
                >
                  <td className="px-5 py-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'hsl(237 20% 94%)', color: 'hsl(237 55% 36%)' }}>
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
                  <td className="px-5 py-3.5">
                    {item.fields.fachgebiet ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'hsl(237 20% 94%)', color: 'hsl(237 55% 36%)' }}>
                        <BookOpen size={11} />{item.fields.fachgebiet}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-8 w-8 p-0">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.record_id)} className="h-8 w-8 p-0" style={{ color: 'hsl(0 72% 51%)' }}>
                        <Trash2 size={14} />
                      </Button>
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
            <DialogTitle>{editing ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Max Mustermann" />
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
              <Label>Fachgebiet</Label>
              <Input value={form.fachgebiet} onChange={e => setForm(f => ({ ...f, fachgebiet: e.target.value }))} placeholder="z.B. Informatik, Mathematik..." />
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
        title="Dozent löschen"
        description="Sind Sie sicher? Dieser Dozent wird dauerhaft gelöscht."
        onConfirm={handleDelete}
      />
    </div>
  );
}
