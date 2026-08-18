"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import type { FormState } from "@/app/admin/client-projects/actions";
import type { Client, ClientProject, ConstructionTeam } from "@/types/domain";

const STAGE_LABELS: Record<string, string> = { ongoing: "진행중", completed: "완료" };

function toDateInputValue(v: string | null | undefined): string {
  if (!v) return "";
  return v.slice(0, 10);
}

export function ProjectForm({
  action,
  initial,
  clients,
  teams,
  defaultDesignCode,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: ClientProject;
  clients: Client[];
  teams: ConstructionTeam[];
  defaultDesignCode?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  const clientOptions = clients.map((c) => c.id);
  const clientLabels = Object.fromEntries(clients.map((c) => [c.id, c.companyName]));

  const teamOptions = ["", ...teams.map((t) => t.id)];
  const teamLabels: Record<string, string> = { "": "미배정", ...Object.fromEntries(teams.map((t) => [t.id, t.name])) };

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="designCode" label="디자인번호 (비워두면 자동 생성)" defaultValue={initial?.designCode ?? defaultDesignCode} />
        <SelectField name="clientId" label="고객사" defaultValue={initial?.clientId ?? clients[0]?.id} options={clientOptions} labels={clientLabels} />
        <TextField name="title" label="프로젝트명" defaultValue={initial?.title} required full />
        <SelectField name="stage" label="진행 상태" defaultValue={initial?.stage ?? "ongoing"} options={["ongoing", "completed"]} labels={STAGE_LABELS} />
        <SelectField name="constructionTeamId" label="시공팀" defaultValue={initial?.constructionTeamId ?? ""} options={teamOptions} labels={teamLabels} />
      </Section>

      <Section legend="시공 일정">
        <TextField name="sitePrepStartDate" label="설치 시작일" type="date" defaultValue={toDateInputValue(initial?.sitePrepStartDate)} />
        <TextField name="sitePrepEndDate" label="설치 종료일" type="date" defaultValue={toDateInputValue(initial?.sitePrepEndDate)} />
        <TextField name="constructionStartDate" label="전시시작일" type="date" defaultValue={toDateInputValue(initial?.constructionStartDate)} />
        <TextField name="constructionEndDate" label="전시종료일" type="date" defaultValue={toDateInputValue(initial?.constructionEndDate)} />
        <TextField name="teardownStartDate" label="철거 시작일" type="date" defaultValue={toDateInputValue(initial?.teardownStartDate)} />
        <TextField name="teardownEndDate" label="철거 종료일" type="date" defaultValue={toDateInputValue(initial?.teardownEndDate)} />
      </Section>

      <Section legend="메모">
        <TextArea name="note" label="메모" defaultValue={initial?.note} rows={3} full />
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
