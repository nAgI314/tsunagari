import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  organizerName: string;
  description?: string;
  responderName: string;
  comment: string;
  onResponderNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
};

export function ResponseInfoPanel({
  title,
  organizerName,
  description,
  responderName,
  comment,
  onResponderNameChange,
  onCommentChange,
}: Props) {
  return (
    <section className="tsu-panel">
      <h2>日程調整への回答</h2>
      <label>
        イベント名
        <Input disabled value={title} />
      </label>
      <label>
        主催者
        <Input disabled value={organizerName} />
      </label>
      <label>
        説明
        <Textarea disabled value={description ?? ""} />
      </label>
      <label>
        あなたの名前
        <Input onChange={(event) => onResponderNameChange(event.target.value)} value={responderName} />
      </label>
      <label>
        コメント
        <Textarea onChange={(event) => onCommentChange(event.target.value)} value={comment} />
      </label>
    </section>
  );
}
