/*eslint-disable @typescript-eslint/no-var-requires*/
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
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
      // Target BOTH normal and sticky logos using shared attributes
      const logoImages = document.querySelectorAll<HTMLImageElement>(
        'a[aria-label="Innova Developments home"][data-navigationcomponent="SiteHeader"] img'
      );

      if (!logoImages || logoImages.length === 0) {
        console.warn("No logo images found.");
        return;
      }

      logoImages.forEach((logo, index) => {
        logo.src = logoPath;
        logo.alt = "Innova Development Logo";
        // console.log(`Replaced logo ${index + 1}`);
      });
    };

    // Replace logos after a short delay
    setTimeout(() => {
      replaceLogos();
    }, 1000);

    // Watch DOM for new logos (like sticky header)
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
