import { Check, Copy } from "lucide-react"
import { Fragment, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"

type TemplateTier = "Free" | "Pro"
type TemplateCategoryKey =
  | "realestate"
  | "job"
  | "recruiting"
  | "business"
  | "formal"

type TemplatePreset = {
  title: string
  description: string
  tier: TemplateTier
  preview: string
}

type CategoryPreset = {
  label: string
  presets: TemplatePreset[]
}

const CATEGORY_ORDER: TemplateCategoryKey[] = [
  "realestate",
  "job",
  "recruiting",
  "business",
  "formal",
]

const CATEGORY_PRESETS: Record<TemplateCategoryKey, CategoryPreset> = {
  realestate: {
    label: "Real estate",
    presets: [
      {
        title: "Premium property invitation",
        description: "Warm, confident client outreach for a high-end visit.",
        tier: "Pro",
        preview: `Subject: A quiet viewing, tailored to what matters to you

Hello {{ClientName}},

Based on what you shared - {{ClientFocus}} - I believe {{PropertyName}} is worth a calm, focused visit.
Key points you'll appreciate:
- {{CoreSellingPoint1}}
- {{CoreSellingPoint2}}
- {{ScarcityOrTiming}}

Would {{PreferredTime}} work for a 20-30 min viewing?

Kind regards,
{{YourName}}`,
      },
      {
        title: "Property recommendation proposal",
        description: "Structured project-style proposal for investors or buyers.",
        tier: "Pro",
        preview: `{{ProjectName}} - Recommendation Summary

1) Overview
Location: {{Location}}
Positioning: {{TargetAudience}}

2) Why now
Market context: {{MarketContext}}
Demand signal: {{DemandSignal}}

3) Investment rationale
Expected yield: {{Yield}}
Value drivers: {{ValueDrivers}}

Recommendation
Proceed with {{NextStep}} on {{Timeline}}.`,
      },
      {
        title: "Follow-up after visit",
        description: "Short follow-up that keeps momentum without pressure.",
        tier: "Free",
        preview: `Hi {{ClientName}},

Thank you for visiting {{PropertyName}} today.
Based on your priorities ({{ClientFocus}}), the best fit seems to be {{BestFitAngle}}.

If you'd like, I can share:
- A concise comparison with {{AltOption}}
- The next steps and timeline

Best,
{{YourName}}`,
      },
    ],
  },
  job: {
    label: "Job search",
    presets: [
      {
        title: "ATS-aligned cover letter",
        description: "Keyword-forward letter that still sounds human.",
        tier: "Pro",
        preview: `Dear {{HiringManagerName}},

I am applying for {{Role}} at {{Company}}.
I match the role through:
- {{Keyword1}} demonstrated by {{Proof1}}
- {{Keyword2}} demonstrated by {{Proof2}}
- {{Keyword3}} demonstrated by {{Proof3}}

In my recent work, I achieved {{MetricResult}} by {{Action}}.

Sincerely,
{{YourName}}`,
      },
      {
        title: "Interview thank-you note",
        description: "Short, sincere note with one value reminder.",
        tier: "Free",
        preview: `Hi {{InterviewerName}},

Thank you for your time today - I enjoyed discussing {{Topic}}.
I am especially excited about {{ExcitingPart}}, and I believe my work on {{Strength}} can help {{Outcome}}.

Best,
{{YourName}}`,
      },
      {
        title: "Salary negotiation email",
        description: "Calm, firm framing with flexible options.",
        tier: "Pro",
        preview: `Hi {{Name}},

Thank you again - I am excited about the opportunity.
Based on the scope ({{Scope}}) and market benchmarks, I would like to align on {{Range}}.

I am flexible on structure:
Option A: {{BaseA}} + {{BonusA}}
Option B: {{BaseB}} + {{EquityOrBenefits}}

Best,
{{YourName}}`,
      },
    ],
  },
  recruiting: {
    label: "Recruiting",
    presets: [
      {
        title: "Candidate recommendation report",
        description: "Clear recruiter summary with fit and risks.",
        tier: "Pro",
        preview: `Candidate: {{CandidateName}} - {{Title}}

Snapshot
- {{Years}} years in {{Domain}}
- Strengths: {{Strengths}}
- Motivations: {{Motivations}}

Why they fit {{Company}} / {{Role}}
1) {{FitPoint1}}
2) {{FitPoint2}}
3) {{FitPoint3}}

Next step: {{NextStep}}`,
      },
      {
        title: "Inbound outreach (warm)",
        description: "Soft outreach that respects time and earns replies.",
        tier: "Free",
        preview: `Hi {{CandidateName}},

I came across your work in {{Domain}} - especially {{SpecificSignal}}.
I am recruiting for a {{Role}} where the focus is {{Focus}}.

If you are open, I would love a quick 15-min chat this week.

Best,
{{YourName}}`,
      },
    ],
  },
  business: {
    label: "Business proposal",
    presets: [
      {
        title: "SaaS partnership proposal",
        description: "One-page collaboration pitch with ROI framing.",
        tier: "Pro",
        preview: `Partnership Proposal - {{ClientCompany}} x {{YourCompany}}

Context
{{ClientPainPoint}}

Solution
{{YourSolution}} focused on {{Outcome}}.

Plan
Phase 1 ({{Weeks1}}): {{Phase1}}
Phase 2 ({{Weeks2}}): {{Phase2}}

Expected impact
- {{Impact1}}
- {{Impact2}}
ROI estimate: {{ROI}}`,
      },
      {
        title: "Freelance quote and scope",
        description: "Simple, professional quote to avoid scope creep.",
        tier: "Free",
        preview: `Quote - {{ProjectName}}

Scope
- {{Deliverable1}}
- {{Deliverable2}}
- {{Deliverable3}}

Timeline
Start: {{StartDate}}
Delivery: {{DeliveryDate}}

Price
Total: {{Price}}
Includes: {{Revisions}} revisions`,
      },
    ],
  },
  formal: {
    label: "Formal letters",
    presets: [
      {
        title: "Payment reminder (polite)",
        description: "Formal reminder with clear deadline and next action.",
        tier: "Pro",
        preview: `Subject: Payment reminder - {{InvoiceNumber}}

Hello,

We note that invoice {{InvoiceNumber}} dated {{InvoiceDate}} for {{Amount}} remains unpaid.
Please arrange payment by {{Deadline}}.

If payment has already been made, please share the transfer confirmation.

Sincerely,
{{YourName}}
{{Company}}`,
      },
      {
        title: "Formal response letter",
        description: "Structured reply with facts and resolution path.",
        tier: "Free",
        preview: `Subject: Response regarding {{Topic}}

Hello,

We acknowledge receipt of your message dated {{Date}}.
Facts:
1) {{Fact1}}
2) {{Fact2}}

Our position:
{{Position}}

Proposed resolution:
{{Resolution}}

Sincerely,
{{YourName}}`,
      },
    ],
  },
}

const tierBadgeStyles: Record<TemplateTier, string> = {
  Free:
    "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  Pro: "border-primary/30 bg-primary/10 text-primary",
}

function renderPreview(template: string) {
  const lines = template.split("\n")

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\{\{[^}]+\}\})/g).filter(Boolean)
    return (
      <Fragment key={`line-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          const isPlaceholder = part.startsWith("{{") && part.endsWith("}}")
          if (!isPlaceholder) {
            return <Fragment key={`part-${lineIndex}-${partIndex}`}>{part}</Fragment>
          }
          return (
            <span
              key={`part-${lineIndex}-${partIndex}`}
              className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-semibold text-primary"
            >
              {part}
            </span>
          )
        })}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </Fragment>
    )
  })
}

export function PopularTemplatesPanel() {
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategoryKey>("realestate")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copiedText, copy] = useCopyToClipboard()
  const { showErrorToast, showSuccessToast } = useCustomToast()

  const activePresetGroup = CATEGORY_PRESETS[activeCategory]
  const presets = activePresetGroup.presets
  const selectedTemplate = presets[selectedIndex] ?? presets[0]

  if (!selectedTemplate) {
    return null
  }

  const handleCategoryChange = (category: TemplateCategoryKey) => {
    setActiveCategory(category)
    setSelectedIndex(0)
  }

  const handleCopy = async () => {
    const ok = await copy(selectedTemplate.preview)
    if (ok) {
      showSuccessToast("Template copied to clipboard")
      return
    }
    showErrorToast("Copy failed")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Templates</CardTitle>
        <CardDescription>
          Pick a category, preview a high-performing template, and copy it
          directly into your workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-3 rounded-[var(--radius-panel)] border border-border/70 bg-background/55 p-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((category) => {
              const isActive = category === activeCategory
              return (
                <button
                  key={category}
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                  onClick={() => handleCategoryChange(category)}
                >
                  {CATEGORY_PRESETS[category].label}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {presets.map((preset, index) => {
              const isSelected = index === selectedIndex
              return (
                <button
                  key={`${preset.title}-${index}`}
                  type="button"
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-[var(--radius-control)] border p-4 text-left transition-colors",
                    isSelected
                      ? "border-primary/35 bg-primary/5"
                      : "border-border bg-card hover:border-primary/20"
                  )}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xl font-semibold tracking-tight">
                      {preset.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {preset.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("mt-1", tierBadgeStyles[preset.tier])}
                  >
                    {preset.tier}
                  </Badge>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="space-y-3 rounded-[var(--radius-panel)] border border-border/70 bg-muted/35 p-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Template Preview
            </p>
            <h3 className="mt-1 text-base font-bold tracking-wide uppercase">
              {selectedTemplate.title}
            </h3>
          </div>

          <div className="min-h-[320px] rounded-[var(--radius-control)] border border-border/70 bg-background p-4 text-sm leading-7 text-foreground">
            {renderPreview(selectedTemplate.preview)}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-2" onClick={handleCopy}>
              {copiedText === selectedTemplate.preview ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copiedText === selectedTemplate.preview
                ? "Copied"
                : "Copy template"}
            </Button>
          </div>
        </aside>
      </CardContent>
    </Card>
  )
}

export default PopularTemplatesPanel
