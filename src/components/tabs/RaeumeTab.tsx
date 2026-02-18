import { useState, useEffect } from 'react';
import type { Raeume } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Building2, DoorOpen } from 'lucide-react';

export function RaeumeTab() {
  const [items, setItems] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Raeume | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ raumname: '', gebaeude: '', kapazitaet: '' });

  const load = () => {
    setLoading(true);
    LivingAppsService.getRaeume().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ raumname: '', gebaeude: '', kapazitaet: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Raeume) => {
    setEditing(item);
    setForm({
      raumname: item.fields.raumname || '',
      gebaeude: item.fields.gebaeude || '',
      kapazitaet: item.fields.kapazitaet != null ? String(item.fields.kapazitaet) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.raumname.trim()) return;
    setSaving(true);
    try {
      const fields = {
        raumname: form.raumname,
        gebaeude: form.gebaeude || undefined,
        kapazitaet: form.kapazitaet ? Number(form.kapazitaet) : undefined,
      };
      if (editing) {
        await LivingAppsService.updateRaeumeEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await LivingAppsService.deleteRaeumeEntry(deleteId);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Räume</h2>
          <p className="text-sm" style={{ color: 'hsl(237 10% 48%)' }}>{items.length} Einträge</p>
        </div>
        <Button onClick={openNew} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)', boxShadow: 'var(--shadow-elegant)' }} className="gap-2">
          <Plus size={16} /> Raum hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Laden...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'hsl(237 10% 55%)' }}>
          <DoorOpen size={40} strokeWidth={1.5} />
          <p className="font-medium">Noch keine Räume eingetragen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.record_id} className="rounded-xl p-5" style={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(237 15% 88%)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(237 20% 94%)' }}>
                    <DoorOpen size={20} style={{ color: 'hsl(237 55% 36%)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{item.fields.raumname}</div>
                    {item.fields.gebaeude && (
                      <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'hsl(237 10% 48%)' }}>
                        <Building2 size={11} />{item.fields.gebaeude}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0"><Pencil size={13} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.record_id)} className="h-7 w-7 p-0" style={{ color: 'hsl(0 72% 51%)' }}><Trash2 size={13} /></Button>
                </div>
              </div>
              {item.fields.kapazitaet != null && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid hsl(237 15% 92%)' }}>
                  <span className="text-xs font-medium" style={{ color: 'hsl(237 10% 48%)' }}>Kapazität: </span>
                  <span className="text-sm font-bold" style={{ color: 'hsl(237 55% 36%)' }}>{item.fields.kapazitaet} Plätze</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Raumname *</Label>
              <Input value={form.raumname} onChange={e => setForm(f => ({ ...f, raumname: e.target.value }))} placeholder="z.B. Raum A101" />
            </div>
            <div className="grid gap-1.5">
              <Label>Gebäude</Label>
              <Input value={form.gebaeude} onChange={e => setForm(f => ({ ...f, gebaeude: e.target.value }))} placeholder="z.B. Hauptgebäude" />
            </div>
            <div className="grid gap-1.5">
              <Label>Kapazität</Label>
              <Input type="number" value={form.kapazitaet} onChange={e => setForm(f => ({ ...f, kapazitaet: e.target.value }))} placeholder="z.B. 30" min="1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.raumname.trim()} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)' }}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Raum löschen"
        description="Sind Sie sicher? Dieser Raum wird dauerhaft gelöscht."
        onConfirm={handleDelete}
      />
    </div>
  );
}
