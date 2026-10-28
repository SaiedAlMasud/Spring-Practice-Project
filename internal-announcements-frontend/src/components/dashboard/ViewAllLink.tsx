import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ViewAllLink() {
  return (
    <Link
      to="/announcements"
      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
    >
      View all
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}
