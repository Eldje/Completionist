import { definePlugin } from "@decky/api";
import { FaCircle } from "react-icons/fa";
import { initGameDetailPatch } from "./patches/gameDetailPatch";
import { initGamesCapsulesPatch } from "./patches/gamesCapsulesPatch";
//import { initHeroCapsulePatch } from "./patches/heroCapsulePatch";
import contextMenuPatch, { LibraryContextMenu } from './patches/contextMenuPatch';
import { Patch } from "@decky/ui";

export default definePlugin(() => {
  console.log("[Completionist] LOG 1: Main Plugin Loading");

  // --- PATCHING GAME DETAIL VIEW ---
  let detailHandle: Patch | undefined;
  detailHandle = initGameDetailPatch(() => {
    if (detailHandle) {
      console.log("[Completionist] LOG 7a: Detail Badge rendered, unpatching monitor.");
      detailHandle.unpatch();
      detailHandle = undefined;
    }
  });

  // --- PATCHING GENERIC CAPSULES ---
  let capsuleHandle: Patch | undefined;
  capsuleHandle = initGamesCapsulesPatch(() => {
    if (capsuleHandle) {
      console.log("[Completionist] LOG 7b: First Capsule rendered, unpatching monitor.");
      capsuleHandle.unpatch();
      capsuleHandle = undefined;
    }
  });

  // --- PATCHING HERO CAPSULE ---
  //let heroHAndle: Patch | undefined;
  //heroHAndle = initHeroCapsulePatch();

  // --- PATCHING CONTEXT MENU ---  
  // (code adapted from SteamgridDB decky plugin)
  contextMenuPatch(LibraryContextMenu);

  return {
    name: "completionist",
    title: "Completionist",
    icon: <FaCircle />,
    onDismount() {
      // Sécurité si l'utilisateur quitte sans avoir affiché de jeux/capsules
      console.log("[Completionist] LOG 13: Final Cleanup");
      detailHandle?.unpatch();
      capsuleHandle?.unpatch();
      //heroHAndle?.unpatch();
    }
  };
});