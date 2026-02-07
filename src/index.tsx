import { definePlugin } from "@decky/api";
import { Patch } from "@decky/ui";
import { FaCircle } from "react-icons/fa";
import { initGameDetailPatch } from "./patches/gameDetailPatch";
import { initGamesCapsulesPatch } from "./patches/gamesCapsulesPatch";

export default definePlugin(() => {
  const patches: (Patch | undefined)[] = [];

  console.log("[Completionist] LOG 1: Main Plugin Loading");

  // Initialize both patching systems
  patches.push(initGameDetailPatch());
  patches.push(initGamesCapsulesPatch());

  return {
    name: "completionist",
    title: "Completionist",
    icon: <FaCircle />,
    onDismount() {
      console.log("[Completionist] LOG 13: Global Unpatching");
      patches.forEach(p => p?.unpatch());
    }
  };
});