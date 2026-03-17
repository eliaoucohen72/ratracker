import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Radio, FlaskConical } from "lucide-react";

export default function ModeToggle({ isLive, onToggle }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
      <FlaskConical className={`w-4 h-4 ${!isLive ? "text-purple-400" : "text-muted-foreground"}`} />
      <Label className="text-sm font-inter text-muted-foreground cursor-pointer" htmlFor="mode-toggle">
        Demo
      </Label>
      <Switch
        id="mode-toggle"
        checked={isLive}
        onCheckedChange={onToggle}
      />
      <Label className="text-sm font-inter text-muted-foreground cursor-pointer" htmlFor="mode-toggle">
        Live
      </Label>
      <Radio className={`w-4 h-4 ${isLive ? "text-emerald-400" : "text-muted-foreground"}`} />
    </div>
  );
}