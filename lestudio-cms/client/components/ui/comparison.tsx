import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const leStudioPoints = [
  "Livraisons de designs toutes les 48h",
  "Tarif clair, fixe et transparent",
  "Équipe complète et polyvalente",
  "Process simple avec collaboration en asynchrone",
  "Communication directe avec un seul interlocuteur",
  "Abonnement ou projet : flexible à tout moment",
];

const othersPoints = [
  "Délais imprévisibles, de plusieurs semaines à des process internes qui ralentissent tout",
  "Tarifs flous : horaires imprévisibles, contrats rigides ou coûts salariaux peu flexibles",
  "Compétences dispersées, cloisonnées ou limitées selon l'interlocuteur",
  "Process incertain : qualité variable, interlocuteurs multiples ou lourdeurs internes",
  "Communication ralentie par les délais, les intermédiaires ou la complexité interne",
  "Flexibilité limitée : évolutions complexes, adaptations difficiles ou ressources rigides",
];

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary">
        <Check className="size-3 text-primary-foreground" aria-hidden />
      </span>
      <span className="text-sm text-foreground">{text}</span>
    </li>
  );
}

function CrossRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
        <X className="size-3 text-muted-foreground" aria-hidden />
      </span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </li>
  );
}

export function Comparison() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-primary/30 ring-1 ring-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">
              LeStudio
            </CardTitle>
            <Badge variant="default">Recommandé</Badge>
          </div>
          <CardDescription>
            Une équipe complète, sans les inconvénients d'un freelance, d'une
            agence ou d'un salarié.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <ul className="flex flex-col gap-3">
            {leStudioPoints.map((point) => (
              <CheckRow key={point} text={point} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-muted-foreground">
            Freelance, agences, salariés
          </CardTitle>
          <CardDescription>
            Les points de friction les plus courants avec les alternatives
            classiques.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <ul className="flex flex-col gap-3">
            {othersPoints.map((point) => (
              <CrossRow key={point} text={point} />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
