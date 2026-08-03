import { FrameSpecForm } from "@/app/admin/frame-specs/frame-spec-form";
import { saveNewFrameSpec } from "@/app/admin/frame-specs/actions";

export default function NewFrameSpecPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">Frame Specification 신규 등록</h1>
      <FrameSpecForm action={saveNewFrameSpec} />
    </div>
  );
}
