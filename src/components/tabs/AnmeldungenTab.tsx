import { useState, useEffect } from 'react';
import type { Anmeldungen, Teilnehmer, Kurse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function AnmeldungenTab() {
  const [items, setItems] = useState<Anmeldungen[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anmeldungen | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ teilnehmer: '', kurs: '', anmeldedatum: '', bezahlt: false });

  const load = () => {
    setLoading(true);
    Promise.all([
      LivingAppsService.getAnmeldungen(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getKurse(),
    ]).then(([a, t, k]) => {
      setItems(a);
      setTeilnehmer(t);
      setKurse(k);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ teilnehmer: '', kurs: '', anmeldedatum: new Date().toISOString().split('T')[0], bezahlt: false });
    setDialogOpen(true);
  };

  const openEdit = (item: Anmeldungen) => {
    setEditing(item);
    setForm({
      teilnehmer: extractRecordId(item.fields.teilnehmer) || '',
      kurs: extractRecordId(item.fields.kurs) || '',
      anmeldedatum: item.fields.anmeldedatum || '',
      bezahlt: item.fields.bezahlt || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.teilnehmer || !form.kurs) return;
    setSaving(true);
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, form.teilnehmer),
        kurs: createRecordUrl(APP_IDS.KURSE, form.kurs),
        anmeldedatum: form.anmeldedatum || undefined,
        bezahlt: form.bezahlt,
      };
      if (editing) {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await LivingAppsService.deleteAnmeldungenEntry(deleteId);
    setDeleteId(null);
    load();
  };

  const getTeilnehmerName = (url?: string) => {
    const id = extractRecordId(url);
    return teilnehmer.find(t => t.record_id === id)?.fields.name || '—';
  };

  const getKursTitel = (url?: string) => {
    const id = extractRecordId(url);
    return kurse.find(k => k.record_id === id)?.fields.titel || '—';
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
  };

  const bezahltCount = items.filter(i => i.fields.bezahlt).length;
  const offenCount = items.length - bezahltCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Anmeldungen</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(167 58% 28%)' }}>
              <CheckCircle size={12} /> {bezahltCount} bezahlt
            </span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(28 90% 42%)' }}>
              <XCircle size={12} /> {offenCount} offen
            </span>
          </div>
        </div>
        <Button onClick={openNew} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)', boxShadow: 'var(--shadow-elegant)' }} className="gap-2">
          <Plus size={16} /> Anmeldung hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Laden...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'hsl(237 10% 55%)' }}>
          <ClipboardList size={40} strokeWidth={1.5} />
          <p className="font-medium">Noch keine Anmeldungen vorhanden</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(237 15% 88%)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(237 20% 97%)', borderBottom: '1px solid hsl(237 15% 88%)' }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Teilnehmer</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Kurs</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Anmeldedatum</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: 'hsl(237 10% 40%)' }}>Bezahlt</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.record_id} className="table-row-hover" style={{ borderTop: i > 0 ? '1px solid hsl(237 15% 92%)' : undefined, background: 'hsl(0 0% 100%)' }}>
                  <td className="px-5 py-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'hsl(237 20% 94%)', color: 'hsl(237 55% 36%)' }}>
                        {getTeilnehmerName(item.fields.teilnehmer)[0]?.toUpperCase()}
                      </div>
                      {getTeilnehmerName(item.fields.teilnehmer)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium" style={{ color: 'hsl(237 40% 28%)' }}>{getKursTitel(item.fields.kurs)}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'hsl(237 10% 45%)' }}>
                    {formatDate(item.fields.anmeldedatum)}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.fields.bezahlt ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium badge-status-aktiv">
                        <CheckCircle size={11} /> Bezahlt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium badge-status-geplant">
                        <XCircle size={11} /> Offen
                      </span>
                    )}
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
            <DialogTitle>{editing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Teilnehmer *</Label>
              <Select value={form.teilnehmer || 'none'} onValueChange={v => setForm(f => ({ ...f, teilnehmer: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Teilnehmer wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bitte wählen...</SelectItem>
                  {teilnehmer.map(t => <SelectItem key={t.record_id} value={t.record_id}>{t.fields.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Kurs *</Label>
              <Select value={form.kurs || 'none'} onValueChange={v => setForm(f => ({ ...f, kurs: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Kurs wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bitte wählen...</SelectItem>
                  {kurse.map(k => <SelectItem key={k.record_id} value={k.record_id}>{k.fields.titel}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Anmeldedatum</Label>
              <Input type="date" value={form.anmeldedatum} onChange={e => setForm(f => ({ ...f, anmeldedatum: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'hsl(237 20% 97%)', border: '1px solid hsl(237 15% 88%)' }}>
              <Checkbox
                id="bezahlt"
                checked={form.bezahlt}
                onCheckedChange={v => setForm(f => ({ ...f, bezahlt: !!v }))}
              />
              <Label htmlFor="bezahlt" className="cursor-pointer font-medium">Zahlung eingegangen</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.teilnehmer || !form.kurs} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)' }}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Anmeldung löschen"
        description="Sind Sie sicher? Diese Anmeldung wird dauerhaft gelöscht."
        onConfirm={handleDelete}
      />
    </div>
  );
}
