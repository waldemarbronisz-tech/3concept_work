"use client";

import { Clock, House, Inbox, Menu } from "lucide-react";
import { useState } from "react";
import { AlarmBar } from "@/components/ui/AlarmBar";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { formatHours } from "@/components/ui/format";
import { OptionAction, OptionCard } from "@/components/ui/OptionCard";
import { RbhBar } from "@/components/ui/RbhBar";
import { SheetHeader } from "@/components/ui/SheetHeader";
import { Status } from "@/components/ui/Status";
import { packageStatusView, type WorkPackageStatus } from "@/components/ui/package-status";
import { Stepper } from "@/components/ui/Stepper";
import { Tag } from "@/components/ui/Tag";
import { TextField } from "@/components/ui/TextField";

// Dane fikcyjne, przepisane z docs/ui/preview.html.

interface PreviewPackage {
  code: string;
  name: string;
  stage: string;
  status: WorkPackageStatus;
  actual: number;
  plan: number;
}

const PACKAGES: PreviewPackage[] = [
  {
    code: "TRS-02",
    name: "Koryta kablowe, kanał K2",
    stage: "Trasy kablowe",
    status: "BLOCKED",
    actual: 12.5,
    plan: 40,
  },
  {
    code: "OBW-03",
    name: "Podłączenia szafy R1",
    stage: "Obwody wtórne · bud. stacyjny",
    status: "TO_ACCEPT",
    actual: 118,
    plan: 110,
  },
  {
    code: "KAB-01",
    name: "Układanie kabli SN",
    stage: "Kable · Q3",
    status: "IN_PROGRESS",
    actual: 42,
    plan: 60,
  },
  {
    code: "KON-01",
    name: "Konstrukcje wsporcze aparatury",
    stage: "Konstrukcje · Q1–Q4",
    status: "ACCEPTED",
    actual: 80,
    plan: 96,
  },
  {
    code: "KAB-02",
    name: "Obróbka i podłączenie kabli SN",
    stage: "Kable · Q3",
    status: "PLANNED",
    actual: 0,
    plan: 45,
  },
];

/** Pakiety, na których pracownik był ostatnio — do szybkiego wyboru. */
const MY_PACKAGES = ["KAB-01", "OBW-03"].flatMap((code) => PACKAGES.filter((p) => p.code === code));

const viewOf = (p: PreviewPackage) => packageStatusView(p.status, { overPlan: p.actual > p.plan });

const COLUMNS: DataTableColumn<PreviewPackage>[] = [
  {
    key: "code",
    header: "Pakiet",
    render: (p) => (
      <>
        <Tag>{p.code}</Tag>
        <span className="mt-0.5 block text-[12.5px] text-ink-2">{p.name}</span>
      </>
    ),
  },
  { key: "stage", header: "Etap / pole", render: (p) => p.stage },
  {
    key: "status",
    header: "Stan",
    render: (p) => {
      const v = viewOf(p);
      return <Status variant={v.variant}>{v.label}</Status>;
    },
  },
  {
    key: "rbh",
    header: "rbh wyk. / plan",
    numeric: true,
    render: (p) => `${formatHours(p.actual)} / ${formatHours(p.plan)}`,
  },
  {
    key: "bar",
    header: "Wykonanie względem planu",
    width: "190px",
    render: (p) => <RbhBar actual={p.actual} plan={p.plan} />,
  },
];

type Filter = "all" | "attention" | "running";

const FILTERS: Record<Filter, { label: string; match: (p: PreviewPackage) => boolean }> = {
  all: { label: "Wszystkie", match: () => true },
  attention: {
    label: "Wymagają reakcji",
    match: (p) => ["warn", "alarm"].includes(viewOf(p).variant),
  },
  running: { label: "W toku", match: (p) => p.status === "IN_PROGRESS" },
};

const DAYS = [
  { label: "Wczoraj", date: "28.09" },
  { label: "Dziś", date: "29.09" },
];

const NAV_ICON = { size: 24, strokeWidth: 1.8, "aria-hidden": true } as const;

function Caption({ children }: { children: string }) {
  return (
    <p className="mb-2 font-mono text-[11px] font-semibold tracking-[.12em] text-ink-2 uppercase">
      {children}
    </p>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="mb-2 block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
      {children}
    </span>
  );
}

function PhoneTimeEntry() {
  const [day, setDay] = useState("29.09");
  const [hours, setHours] = useState(8);
  const [pkg, setPkg] = useState("KAB-01");
  const [feedback, setFeedback] = useState("Wczoraj 8,0 h · zatwierdzone przez brygadzistę");

  return (
    <div className="flex h-[760px] min-w-0 flex-col border-[1.5px] border-ink bg-surface">
      <AppBar
        title="Wpis czasu"
        backHref="/"
        titleBlock={[
          { label: "Bud.", value: "075", mono: true },
          { label: "Obiekt", value: "SE Olszyna 110/15 kV" },
          { label: "Data", value: day, mono: true },
        ]}
      />

      <form
        id="time-entry"
        autoComplete="off"
        className="flex flex-1 flex-col gap-5 overflow-auto px-3 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback(`Zapisano ${formatHours(hours)} h · ${pkg} · czeka na brygadzistę`);
        }}
      >
        <div>
          <SectionLabel>Dzień</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {DAYS.map((d) => (
              <Button key={d.date} pressed={day === d.date} onClick={() => setDay(d.date)}>
                {d.label}
              </Button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="contents">
            <SectionLabel>Pakiet</SectionLabel>
          </legend>
          <div className="flex flex-col gap-2">
            {MY_PACKAGES.map((p) => (
              <OptionCard
                key={p.code}
                name="package"
                value={p.code}
                checked={pkg === p.code}
                onChange={() => setPkg(p.code)}
                description={p.name}
              >
                <Tag>{p.code}</Tag>
              </OptionCard>
            ))}
            <OptionAction>Wybierz inny pakiet</OptionAction>
          </div>
        </fieldset>

        <div>
          <SectionLabel>Godziny</SectionLabel>
          <Stepper label="Godziny" value={hours} onChange={setHours} quickValues={[4, 6, 8, 10]} />
        </div>

        <fieldset>
          <legend className="contents">
            <SectionLabel>Rodzaj czasu</SectionLabel>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {["Na pakiecie", "Pomocnicza", "Przestój", "Zastępcza"].map((kind, i) => (
              <OptionCard
                key={kind}
                name="time-kind"
                value={kind}
                defaultChecked={i === 0}
                className="text-sm"
              >
                {kind}
              </OptionCard>
            ))}
          </div>
        </fieldset>

        <TextField id="note" label="Uwaga · opcjonalnie" placeholder="np. brak dostawy koryt" />
      </form>

      <div className="flex flex-col gap-1.5 border-t border-line px-3 py-2.5">
        <Button type="submit" form="time-entry" variant="primary" size="lg" className="w-full">
          {`Zapisz ${formatHours(hours)} h`}
        </Button>
        <p aria-live="polite" className="text-center text-[12.5px] text-ink-2">
          {feedback}
        </p>
      </div>

      <BottomNav
        items={[
          { href: "#kolejka", label: "Kolejka", icon: <Inbox {...NAV_ICON} /> },
          { href: "#czas", label: "Czas", icon: <Clock {...NAV_ICON} />, current: true },
          { href: "#budowy", label: "Budowy", icon: <House {...NAV_ICON} /> },
          { href: "#menu", label: "Menu", icon: <Menu {...NAV_ICON} /> },
        ]}
      />
    </div>
  );
}

function DesktopPackages() {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = PACKAGES.filter(FILTERS[filter].match);
  const actual = PACKAGES.reduce((sum, p) => sum + p.actual, 0);
  const plan = PACKAGES.reduce((sum, p) => sum + p.plan, 0);

  return (
    <div className="min-w-0 border-[1.5px] border-ink bg-surface">
      <SheetHeader
        cells={[
          { label: "Budowa", value: "075", mono: true },
          { label: "Obiekt", value: "SE Olszyna 110/15 kV" },
          { label: "Arkusz", value: "Pakiety robocze" },
          { label: "Aktualizacja", value: "29.09 14:20 · inż. budowy" },
        ]}
      />

      <AlarmBar label="Blokada" action={<Button>Szczegóły</Button>}>
        <Tag>TRS-02</Tag> Koryta kablowe K2: brak materiału. Zamówienie <Tag>PO-075-014</Tag>,
        dostawa 02.10.
      </AlarmBar>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div role="group" aria-label="Filtr" className="flex flex-wrap gap-1.5">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Button
              key={key}
              pressed={filter === key}
              className="px-3 text-[13.5px]"
              onClick={() => setFilter(key)}
            >
              {`${FILTERS[key].label} ${PACKAGES.filter(FILTERS[key].match).length}`}
            </Button>
          ))}
        </div>
        <span className="flex-1" />
        <Button variant="primary">+ Nowy pakiet</Button>
      </div>

      <DataTable
        caption="Pakiety robocze budowy 075"
        columns={COLUMNS}
        rows={rows}
        rowKey={(p) => p.code}
        rowTone={(p) => {
          const v = viewOf(p).variant;
          return v === "alarm" || v === "warn" ? v : undefined;
        }}
      />

      <div className="flex flex-wrap justify-between gap-3 px-4 py-2.5 font-mono text-xs text-ink-2">
        <span>{`${PACKAGES.length} pakietów · ${formatHours(actual)} / ${formatHours(plan)} rbh`}</span>
        <span>Przestoje w tym tygodniu: 6,5 h (brak materiału)</span>
      </div>
    </div>
  );
}

function ComponentSampler() {
  const statuses: WorkPackageStatus[] = [
    "PLANNED",
    "READY",
    "IN_PROGRESS",
    "TO_ACCEPT",
    "ACCEPTED",
    "CLOSED",
    "REWORK",
    "BLOCKED",
  ];

  return (
    <section
      aria-label="Próbnik komponentów"
      className="mx-auto mt-8 max-w-[1280px] border-[1.5px] border-ink bg-surface"
    >
      <SheetHeader brand="Komponenty" cells={[{ label: "Arkusz", value: "Próbnik" }]} />
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5 p-4">
        <div className="flex min-w-0 flex-col">
          <SectionLabel>Przyciski</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Zatwierdź dzień</Button>
            <Button>Popraw</Button>
            <Button pressed>Wybrany</Button>
            <Button disabled>Nieaktywny</Button>
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <SectionLabel>Oznaczniki</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            {["075", "KAB-01", "PO-075-014", "WZ 2026/09/118"].map((code) => (
              <Tag key={code}>{code}</Tag>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 basis-full flex-col">
          <SectionLabel>Stany · kolor tylko przy problemie</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => {
              const v = packageStatusView(s);
              return (
                <Status key={s} variant={v.variant}>
                  {v.label}
                </Status>
              );
            })}
            <Status variant="warn">Ponad plan</Status>
          </div>
        </div>
        <div className="flex min-w-0 basis-full flex-col">
          <SectionLabel>Pasek rbh · 0 / 70 / 100 / 107 / 150 % · bez planu</SectionLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {[
              [0, 40],
              [42, 60],
              [60, 60],
              [118, 110],
              [90, 60],
              [4, 0],
            ].map(([a = 0, p = 0]) => (
              <RbhBar key={`${a}-${p}`} actual={a} plan={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function UiPreview() {
  return (
    <main className="px-4 pt-6 pb-9">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-start gap-7">
        <section aria-label="Telefon: wpis czasu" className="min-w-0 flex-[0_1_380px]">
          <Caption>Telefon · pracownik</Caption>
          <PhoneTimeEntry />
        </section>
        <section aria-label="Desktop: pakiety budowy" className="min-w-0 flex-[1_1_560px]">
          <Caption>Desktop · inżynier / kierownik</Caption>
          <DesktopPackages />
        </section>
      </div>
      <ComponentSampler />
      <p className="mx-auto mt-3 max-w-[1280px] font-mono text-xs text-ink-2">
        Dane przykładowe (fikcyjne). Wzorzec: docs/ui/preview.html · zasady: docs/UI_STYLE.md.
      </p>
    </main>
  );
}
