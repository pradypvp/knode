"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPatch, ApiError } from "@/lib/api";
import { GOAL_OPTIONS } from "@/lib/goal-tracks";

type Project = { title: string; description?: string };

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [interestsRaw, setInterestsRaw] = useState("");
  const [projects, setProjects] = useState<Project[]>([{ title: "", description: "" }]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setDepartment(user.department ?? "");
    setYear(user.year != null ? String(user.year) : "");
    setBio(user.bio ?? "");
    setCareerGoal(user.careerGoal ?? "");
    const ints = user.interests;
    if (Array.isArray(ints)) {
      setInterestsRaw((ints as string[]).join(", "));
    }
    const projs = user.projects;
    if (Array.isArray(projs) && projs.length > 0) {
      setProjects(
        (projs as Project[]).map((p) => ({
          title: p.title ?? "",
          description: p.description ?? "",
        })),
      );
    } else {
      setProjects([{ title: "", description: "" }]);
    }
  }, [user]);

  const save = useCallback(async () => {
    if (!user) return;
    setErr(null);
    setMsg(null);
    setPending(true);
    try {
      const interests = interestsRaw
        .split(/[,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanedProjects = projects
        .filter((p) => p.title.trim().length > 0)
        .map((p) => ({
          title: p.title.trim(),
          ...(p.description?.trim()
            ? { description: p.description.trim() }
            : {}),
        }));
      await apiPatch("/users/me", {
        name: name.trim() || undefined,
        department: department.trim() || null,
        year: year.trim() ? parseInt(year, 10) : null,
        bio: bio.trim() || null,
        careerGoal: careerGoal || null,
        interests: interests.length ? interests : [],
        projects: cleanedProjects.length ? cleanedProjects : [],
      });
      setMsg("Profile saved.");
      await refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }, [user, name, department, year, bio, careerGoal, interestsRaw, projects, refresh]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          Profile
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          Shown on listings and helps peers understand your background. Academic
          graph matching still uses your{" "}
          <a href="/skills" className="text-[#9b87f5] underline">
            skills
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.03)] p-6">
        {msg ? <p className="text-sm text-[#00e5a0]">{msg}</p> : null}
        {err ? <p className="text-sm text-[#ff4d6a]">{err}</p> : null}

        <div>
          <Label className="text-[rgba(240,238,255,0.55)]">Display name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-[rgba(240,238,255,0.55)]">Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="ECE, CSE, …"
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <div>
            <Label className="text-[rgba(240,238,255,0.55)]">Year (1–8)</Label>
            <Input
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2"
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
        </div>

        <div>
          <Label className="text-[rgba(240,238,255,0.55)]">Career goal</Label>
          <select
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] px-3 text-sm text-[#f0eeff] outline-none"
          >
            <option value="">Not set</option>
            {GOAL_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
            Matchmaker will prioritize skills relevant to this goal.
          </p>
        </div>

        <div>
          <Label className="text-[rgba(240,238,255,0.55)]">Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="What you care about, how you like to collaborate…"
            className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
          />
        </div>

        <div>
          <Label className="text-[rgba(240,238,255,0.55)]">
            Interested fields (comma-separated)
          </Label>
          <Input
            value={interestsRaw}
            onChange={(e) => setInterestsRaw(e.target.value)}
            placeholder="systems, ML, competitive programming"
            className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
          />
        </div>

        <div>
          <Label className="mb-2 block text-[rgba(240,238,255,0.55)]">
            Projects (title + optional description)
          </Label>
          <div className="flex flex-col gap-3">
            {projects.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-[rgba(155,135,245,0.12)] bg-[rgba(0,0,0,0.2)] p-3"
              >
                <Input
                  placeholder="Project title"
                  value={p.title}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...next[i], title: e.target.value };
                    setProjects(next);
                  }}
                  className="mb-2 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
                />
                <Textarea
                  placeholder="Short description"
                  value={p.description ?? ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...next[i], description: e.target.value };
                    setProjects(next);
                  }}
                  rows={2}
                  className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 text-[#9b87f5]"
            onClick={() => setProjects([...projects, { title: "", description: "" }])}
          >
            + Add project
          </Button>
        </div>

        <Button
          type="button"
          disabled={pending}
          onClick={() => void save()}
          className="w-fit border border-[rgba(155,135,245,0.35)] bg-gradient-to-br from-[rgba(155,135,245,0.15)] to-[rgba(155,135,245,0.05)] text-white"
        >
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
