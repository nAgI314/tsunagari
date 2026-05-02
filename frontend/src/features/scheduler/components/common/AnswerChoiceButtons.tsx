import type { AnswerStatus } from "../../model/types";
import { Circle, Triangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value?: AnswerStatus;
  onSelect: (status: AnswerStatus) => void;
  className?: string;
};

const OPTIONS: {
  status: AnswerStatus;
  label: string;
  Icon: typeof Circle;
  iconClassName: string;
  strokeWidth: number;
}[] = [
  { status: "ok", label: "参加可", Icon: Circle, iconClassName: "h-[14px] w-[14px]", strokeWidth: 2.1 },
  { status: "maybe", label: "未定", Icon: Triangle, iconClassName: "h-[13px] w-[13px]", strokeWidth: 2.1 },
  { status: "ng", label: "参加不可", Icon: X, iconClassName: "h-[15px] w-[15px]", strokeWidth: 2.2 },
];

export function AnswerChoiceButtons({ value, onSelect, className }: Props) {
  return (
    <div className={`tsu-answer-choices ${className ?? ""}`}>
      {OPTIONS.map((option) => (
        <Button
          aria-label={option.label}
          className={`tsu-answer-choice ${option.status} ${value === option.status ? "active" : ""}`}
          key={option.status}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(option.status);
          }}
          type="button"
          variant="outline"
        >
          <option.Icon className={option.iconClassName} strokeWidth={option.strokeWidth} />
        </Button>
      ))}
    </div>
  );
}
