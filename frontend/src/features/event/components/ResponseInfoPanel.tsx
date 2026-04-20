import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  organizerName: string;
  description?: string;
  responseDeadlineLabel: string;
  responderName: string;
  comment: string;
  onResponderNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
};

export function ResponseInfoPanel({
  title,
  organizerName,
  description,
  responseDeadlineLabel,
  responderName,
  comment,
  onResponderNameChange,
  onCommentChange,
}: Props) {
  return (
    <section className="tsu-panel tsu-response-panel">
      <div className="tsu-response-summary">
        <h2>{title}</h2>
        <p className="tsu-response-meta">
          <span>{organizerName}</span>
          <span>{responseDeadlineLabel}</span>
        </p>
        {description && <p className="tsu-response-description">{description}</p>}
      </div>

      <div className="tsu-response-form">
        <Input
          onChange={(event) => onResponderNameChange(event.target.value)}
          placeholder="あなたの名前"
          value={responderName}
        />
        <Textarea
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="コメント（任意）"
          value={comment}
        />
      </div>
    </section>
  );
}
