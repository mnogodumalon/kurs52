import { useState, useEffect } from 'react';
import type { Kurse, Dozenten, Raeume } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, BookOpen, Calendar, Euro, Users } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  geplant: 'Geplant',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
  abgesagt: 'Abgesagt',
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-status-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

type KursStatus = 'geplant' | 'aktiv' | 'abgeschlossen' | 'abgesagt';

const emptyForm: { titel: string; beschreibung: string; startdatum: string; enddatum: string; max_teilnehmer: string; preis: string; dozent: string; raum: string; status: KursStatus } = {
  titel: '', beschreibung: '', startdatum: '', enddatum: '',
  max_teilnehmer: '', preis: '', dozent: '', raum: '', status: 'geplant',
};

export function KurseTab() {
  const [items, setItems] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Kurse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([
      LivingAppsService.getKurse(),
      LivingAppsService.getDozenten(),
      LivingAppsService.getRaeume(),
    ]).then(([k, d, r]) => {
      setItems(k);
      setDozenten(d);
      setRaeume(r);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Kurse) => {
    setEditing(item);
    setForm({
      titel: item.fields.titel || '',
      beschreibung: item.fields.beschreibung || '',
      startdatum: item.fields.startdatum || '',
      enddatum: item.fields.enddatum || '',
      max_teilnehmer: item.fields.max_teilnehmer != null ? String(item.fields.max_teilnehmer) : '',
      preis: item.fields.preis != null ? String(item.fields.preis) : '',
      dozent: extractRecordId(item.fields.dozent) || '',
      raum: extractRecordId(item.fields.raum) || '',
      status: item.fields.status || 'geplant',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titel.trim()) return;
    setSaving(true);
    try {
      const fields: Kurse['fields'] = {
        titel: form.titel,
        beschreibung: form.beschreibung || undefined,
        startdatum: form.startdatum || undefined,
        enddatum: form.enddatum || undefined,
        max_teilnehmer: form.max_teilnehmer ? Number(form.max_teilnehmer) : undefined,
        preis: form.preis ? Number(form.preis) : undefined,
        dozent: form.dozent ? createRecordUrl(APP_IDS.DOZENTEN, form.dozent) : undefined,
        raum: form.raum ? createRecordUrl(APP_IDS.RAEUME, form.raum) : undefined,
        status: form.status || undefined,
      };
      if (editing) {
        await LivingAppsService.updateKurseEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createKurseEntry(fields);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await LivingAppsService.deleteKurseEntry(deleteId);
    setDeleteId(null);
    load();
  };

  const formatDate = (d?: string) => {
    if (!d) return null;
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
  };

  const getDozentName = (url?: string) => {
    const id = extractRecordId(url);
    return dozenten.find(d => d.record_id === id)?.fields.name || null;
  };

  const getRaumName = (url?: string) => {
    const id = extractRecordId(url);
    return raeume.find(r => r.record_id === id)?.fields.raumname || null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Kurse</h2>
          <p className="text-sm" style={{ color: 'hsl(237 10% 48%)' }}>{items.length} Einträge</p>
        </div>
        <Button onClick={openNew} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)', boxShadow: 'var(--shadow-elegant)' }} className="gap-2">
          <Plus size={16} /> Kurs hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'hsl(237 10% 55%)' }}>Laden...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'hsl(237 10% 55%)' }}>
          <BookOpen size={40} strokeWidth={1.5} />
          <p className="font-medium">Noch keine Kurse eingetragen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(item => {
            const dozentName = getDozentName(item.fields.dozent);
            const raumName = getRaumName(item.fields.raum);
            const startFmt = formatDate(item.fields.startdatum);
            const endFmt = formatDate(item.fields.enddatum);
            return (
              <div key={item.record_id} className="rounded-xl p-5" style={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(237 15% 88%)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base mb-1" style={{ letterSpacing: '-0.01em' }}>{item.fields.titel}</div>
                    <StatusBadge status={item.fields.status} />
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0"><Pencil size={13} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.record_id)} className="h-7 w-7 p-0" style={{ color: 'hsl(0 72% 51%)' }}><Trash2 size={13} /></Button>
                  </div>
                </div>

                {item.fields.beschreibung && (
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'hsl(237 10% 48%)' }}>{item.fields.beschreibung}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'hsl(237 10% 48%)' }}>
                  {(startFmt || endFmt) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{startFmt || '?'}{endFmt && ` – ${endFmt}`}</span>
                    </div>
                  )}
                  {item.fields.preis != null && (
                    <div className="flex items-center gap-1.5">
                      <Euro size={12} />
                      <span className="font-semibold" style={{ color: 'hsl(237 55% 36%)' }}>{item.fields.preis.toFixed(2)} €</span>
                    </div>
                  )}
                  {item.fields.max_teilnehmer != null && (
                    <div className="flex items-center gap-1.5">
                      <Users size={12} />
                      <span>Max. {item.fields.max_teilnehmer} Teilnehmer</span>
                    </div>
                  )}
                  {dozentName && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} />
                      <span>{dozentName}</span>
                    </div>
                  )}
                  {raumName && (
                    <div className="flex items-center gap-1.5 col-span-2" style={{ color: 'hsl(237 10% 48%)' }}>
                      <span>Raum: <span className="font-medium" style={{ color: 'hsl(237 25% 20%)' }}>{raumName}</span></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid gap-1.5">
              <Label>Titel *</Label>
              <Input value={form.titel} onChange={e => setForm(f => ({ ...f, titel: e.target.value }))} placeholder="Kursname" />
            </div>
            <div className="grid gap-1.5">
              <Label>Beschreibung</Label>
              <Textarea value={form.beschreibung} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} placeholder="Kursbeschreibung..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Startdatum</Label>
                <Input type="date" value={form.startdatum} onChange={e => setForm(f => ({ ...f, startdatum: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Enddatum</Label>
                <Input type="date" value={form.enddatum} onChange={e => setForm(f => ({ ...f, enddatum: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Max. Teilnehmer</Label>
                <Input type="number" value={form.max_teilnehmer} onChange={e => setForm(f => ({ ...f, max_teilnehmer: e.target.value }))} placeholder="z.B. 20" min="1" />
              </div>
              <div className="grid gap-1.5">
                <Label>Preis (€)</Label>
                <Input type="number" value={form.preis} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} placeholder="z.B. 299" min="0" step="0.01" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Dozent</Label>
              <Select value={form.dozent || 'none'} onValueChange={v => setForm(f => ({ ...f, dozent: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Dozent wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Dozent</SelectItem>
                  {dozenten.map(d => <SelectItem key={d.record_id} value={d.record_id}>{d.fields.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Raum</Label>
              <Select value={form.raum || 'none'} onValueChange={v => setForm(f => ({ ...f, raum: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Raum wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Raum</SelectItem>
                  {raeume.map(r => <SelectItem key={r.record_id} value={r.record_id}>{r.fields.raumname}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as typeof f.status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geplant">Geplant</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  <SelectItem value="abgesagt">Abgesagt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !form.titel.trim()} style={{ background: 'var(--gradient-primary)', color: 'hsl(0 0% 100%)' }}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Kurs löschen"
        description="Sind Sie sicher? Dieser Kurs wird dauerhaft gelöscht."
        onConfirm={handleDelete}
      />
    </div>
  );
}
