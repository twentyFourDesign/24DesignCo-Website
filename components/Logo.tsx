import Link from "next/link";
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-white">
      <span className="font-display relative grid h-11 w-11 place-items-center rounded-lg border-2 border-white text-xl font-extrabold leading-none">
        24<span className="absolute bottom-[7px] right-[7px] h-[5px] w-[5px] rounded-full bg-launch" />
      </span>
      <span className="font-display text-lg font-bold">Design Co.</span>
    </Link>
  );
}
