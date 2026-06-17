interface TrafficLightsProps {
  className?: string;
}

async function getWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export default function TrafficLights({ className }: TrafficLightsProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <button
        onClick={async () => { try { (await getWindow()).close(); } catch {} }}
        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors"
        title="Close"
      />
      <button
        onClick={async () => { try { (await getWindow()).minimize(); } catch {} }}
        className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#f5a623] transition-colors"
        title="Minimize"
      />
      <button
        onClick={async () => { try { (await getWindow()).toggleMaximize(); } catch {} }}
        className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1dad2b] transition-colors"
        title="Maximize"
      />
    </div>
  );
}
