/*eslint-disable @typescript-eslint/no-var-requires*/

import { Log } from "@microsoft/sp-core-library";
import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
// import { Dialog } from "@microsoft/sp-dialog";

import * as strings from "NavigationExtensionApplicationCustomizerStrings";

const LOG_SOURCE: string = "NavigationExtensionApplicationCustomizer";
import "./ExtensionStyle.css";
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface INavigationExtensionApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NavigationExtensionApplicationCustomizer extends BaseApplicationCustomizer<INavigationExtensionApplicationCustomizerProperties> {
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    const logoPath = require("../navigationExtension/assests/Innova_final_logo.jpg");

    const replaceLogos = () => {
      const logoImg = document.querySelector<HTMLImageElement>(
        'a[aria-label*="Innova Developments"] img'
      );
      const logoImgOnScroll = document.querySelector<HTMLImageElement>(
        "a.shyLogoWrapper-131 img"
      );

      if (logoImg) {
        logoImg.src = logoPath;
        logoImg.alt = "Innova Development Logo";
      } else {
        console.warn("Main logo not found.");
      }

      if (logoImgOnScroll) {
        logoImgOnScroll.src = logoPath;
        logoImgOnScroll.alt = "Innova Development Logo";
      } else {
        console.warn("Sticky logo not found.");
      }
    };

    // Run initially after delay
    setTimeout(() => {
      replaceLogos();
    }, 3000);

    // Watch for DOM changes to handle scroll/re-rendered headers
    const observer = new MutationObserver(() => {
      replaceLogos();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return Promise.resolve();
  }
}
