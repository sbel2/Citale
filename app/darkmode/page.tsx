import ManualThemeToggle from "@/components/ManualThemeToggle";

export default function DarkModePage() {
  return (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 mb-4">
        This content switches theme based on the toggled class.
      </div>
      <ManualThemeToggle />
    </div>
  );
}
