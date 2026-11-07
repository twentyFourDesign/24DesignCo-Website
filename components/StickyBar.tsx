import { PrimaryBtn } from "./ui";
export default function StickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy p-3 md:hidden">
      <PrimaryBtn className="block w-full" />
    </div>
  );
}
