import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportPDFButton({ targetId }: { targetId: string }) {
  const exportPDF = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("report.pdf");
  };

  return (
    <button
      onClick={exportPDF}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
    >
      Download PDF
    </button>
  );
}
