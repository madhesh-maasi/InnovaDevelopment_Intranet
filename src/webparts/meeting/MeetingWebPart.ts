import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'MeetingWebPartStrings';
import Meeting from './components/Meeting';
import { IMeetingProps } from './components/IMeetingProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { sp } from '@pnp/sp';
import { graph } from '@pnp/graph';

export interface IMeetingWebPartProps {
  description: string;
}

export default class MeetingWebPart extends BaseClientSideWebPart<IMeetingWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IMeetingProps> = React.createElement(
      Meeting,
      {
        // description: this.properties.description,
        // isDarkTheme: this._isDarkTheme,
        // environmentMessage: this._environmentMessage,
        // hasTeamsContext: !!this.context.sdks.microsoftTeams,
        // userDisplayName: this.context.pageContext.user.displayName
        context:this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

 public async onInit(): Promise<void> {
      SPComponentLoader.loadCss("https://unpkg.com/primeicons/primeicons.css");
      SPComponentLoader.loadCss(
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      );
      sp.setup({
        spfxContext: this.context as unknown as undefined,
      });
  
      // Set up Graph context
      graph.setup({
        spfxContext: this.context as unknown as undefined,
      });
  
      await super.onInit();
    }
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
