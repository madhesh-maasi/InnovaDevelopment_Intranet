/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { sp } from "@pnp/sp/presets/all";
import * as moment from "moment";
import {
  getLibraryFileDetails,
  uploadThumbnail,
} from "../../../../Services/NewsService/NewsService";
import "./AddNewsPanel.css";
import { INewsItem, INewsTemplate } from "../../../../Interface/NewsInterface";
interface IProps {
  context: any;
  onClose: () => void;
  setNewsItem: any;
}

export const AddNewsPanel: React.FC<IProps> = ({
  context,
  onClose,
  setNewsItem,
}) => {
  const domainUrl: string =
    context._pageContext.site.absoluteUrl.split("/sites")[0];
  const [step, setStep] = useState<"template" | "form">("template");
  const [templates, setTemplates] = useState<INewsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [newsForm, setNewsForm] = useState<INewsTemplate>({
    Title: "",
    Description: "",
    StartDate: "",
    EndDate: "",
    Thumbnail: { fileName: "", url: "", file: null },
  });
  const [error, setError] = useState("");
  const loadTemplates = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("Site Pages")
        .items.filter("PageType eq 'Template'")
        .expand("ThumbnailAttachmentsOf")
        .select(
          "*",
          "Title",
          "Description",
          "FileRef",
          "EncodedAbsUrl",
          "ServerRedirectedEmbedUri",
          "UniqueId",
          "StartDate",
          "EndDate",
          "ThumbnailAttachmentsOf/ID"
        )
        .top(5000)
        .get();

      // Fetch thumbnail file details for each item
      const formattedTemplates: INewsTemplate[] = await Promise.all(
        items.map(async (item) => {
          const thumbnailId = item?.ThumbnailAttachmentsOf?.ID;
          const thumbnail = thumbnailId
            ? await getLibraryFileDetails(thumbnailId)
            : null;

          return {
            Title: item.Title,
            Description: item.Description,
            FileRef: item.FileRef,
            EncodedAbsUrl: item.EncodedAbsUrl,
            ServerRedirectedEmbedUri: item.ServerRedirectedEmbedUri,
            UniqueId: item.UniqueId,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Thumbnail: thumbnail
              ? {
                  id: thumbnailId,
                  fileName: thumbnail.fileName,
                  url: thumbnail.url,
                }
              : null,
          };
        })
      );

      setTemplates(formattedTemplates);
      console.log("Loaded Templates:", formattedTemplates);
    } catch (e) {
      console.error("Error loading templates", e);
    }
  };

  const createPage = async () => {
    try {
      setError("");

      // Basic validation
      if (
        !newsForm?.Title?.trim() ||
        !newsForm?.Description?.trim() ||
        !newsForm?.Thumbnail
      ) {
        setError("Please fill all required fields and upload a thumbnail.");
        return;
      }
      // Upload thumbnail
      const thumbId = await uploadThumbnail(newsForm.Thumbnail);
      if (!thumbId) {
        setError("Failed to upload thumbnail.");
        return;
      }
      if (!selectedTemplate?.EncodedAbsUrl) {
        setError("Selected template does not have a valid URL.");
        return;
      }

      const _templateUrl = selectedTemplate.EncodedAbsUrl.replace(
        domainUrl,
        ""
      );
      await sp.web.currentUser.get().then(async (user: any) => {
        let source = await sp.web.loadClientsidePage(_templateUrl);
        let _pageName = `${newsForm.Title.replace(/\s+/g, "-")}.aspx`;
        let dest: any = await sp.web.addClientsidePage(
          _pageName,
          _pageName,
          "Article"
        );
        let _targetId = dest["json"].Id;
        await source.copyTo(dest, false);
        const page = await sp.web.loadClientsidePage(
          dest["json"].AbsoluteUrl.replace(window.location.origin, "")
        );

        await page.setBannerImage(source.bannerImageUrl);
        await page.setAuthorById(user.Id);
        const titleWebPart: any = await page.findControl((c: any) => {
          return (
            c["json"].position.zoneIndex == 1 &&
            (c["title"] === "Title area" || c["title"] === "Banner")
          );
        });
        if (titleWebPart) {
          await titleWebPart.column.remove();
        }
        await page.save(false);
        const pageUrl = `${context.pageContext.web.absoluteUrl}/SitePages/${_pageName}`;
        const pageItem = await sp.web.lists
          .getByTitle("Site Pages")
          .items.filter(`FileLeafRef eq '${_pageName}'`)
          .top(1)
          .get();

        if (!pageItem.length) {
          setError("Failed to find the page item to update metadata.");
          return;
        }

        const pageItemId = pageItem[0].Id;

        await sp.web.lists
          .getByTitle("Site Pages")
          .items.getById(pageItemId)
          .update({
            Title: newsForm.Title,
            Description: newsForm.Description,
            StartDate: newsForm.StartDate
              ? moment(newsForm.StartDate).format("MM/DD/YYYY")
              : null,
            EndDate: newsForm.EndDate
              ? moment(newsForm.EndDate).format("MM/DD/YYYY")
              : null,
            ThumbnailAttachmentsOfId: thumbId,
            PageType: "News",
          })
          .then(async () => {
            setNewsItem((prevItems: INewsItem[]) => [
              ...prevItems,
              {
                id: _targetId,
                title: newsForm.Title,
                description: newsForm.Description,
                thumbnail: {
                  id: thumbId,
                  fileName: newsForm?.Thumbnail?.fileName || "",
                  url: `${window.location.origin}/ThumbnailAttachments/${newsForm?.Thumbnail?.fileName}`,
                },
                siteUrl: pageUrl,
              },
            ]);
          });
      });
    } catch (err) {
      console.error("Error creating news page", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <Sidebar
      position="right"
      visible
      onHide={onClose}
      style={{ width: "90vw" }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left Column */}
        <div style={{ flex: 1 }}>
          {step === "template" ? (
            <>
              <h3>Select Template</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.Id}
                    style={{
                      border:
                        selectedTemplate?.Id === tmpl.Id
                          ? "2px solid blue"
                          : "1px solid gray",
                      padding: 8,
                      cursor: "pointer",
                      width: "30%",
                    }}
                    onClick={() => setSelectedTemplate(tmpl)}
                  >
                    <div>
                      <div style={{ width: "100%", height: "110px" }}>
                        <img
                          src={tmpl?.Thumbnail?.url}
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div>{tmpl.Title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: "right" }}>
                <Button
                  label="Next"
                  disabled={!selectedTemplate}
                  onClick={() => setStep("form")}
                />
              </div>
            </>
          ) : (
            <>
              <h3>Fill News Details</h3>
              <div className="p-fluid">
                <label>Title*</label>
                <InputText
                  value={newsForm?.Title || ""}
                  onChange={(e) =>
                    setNewsForm((prev) => ({ ...prev, Title: e.target.value }))
                  }
                />

                <label>Description*</label>
                <InputTextarea
                  rows={4}
                  value={newsForm?.Description || ""}
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      Description: e.target.value,
                    }))
                  }
                />

                <label>Start Date</label>
                <Calendar
                  value={
                    newsForm?.StartDate ? new Date(newsForm.StartDate) : null
                  }
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      StartDate: e.value
                        ? moment(e.value).format("YYYY-MM-DD")
                        : "",
                    }))
                  }
                  showIcon
                />

                <label>End Date</label>
                <Calendar
                  value={newsForm?.EndDate ? new Date(newsForm.EndDate) : null}
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      EndDate: e.value
                        ? moment(e.value).format("YYYY-MM-DD")
                        : "",
                    }))
                  }
                  showIcon
                />
                <label>Thumbnail*</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewsForm((prev) => ({
                        ...prev!,
                        Thumbnail: {
                          ...prev?.Thumbnail,
                          fileName: file.name,
                          url: URL.createObjectURL(file),
                          file: file,
                        },
                      }));
                    }
                  }}
                />
                {newsForm?.Thumbnail?.fileName && (
                  <div style={{ marginTop: 8 }}>
                    <i className="pi pi-image" /> {newsForm?.Thumbnail.fileName}
                  </div>
                )}

                {error && (
                  <Message
                    severity="error"
                    text={error}
                    style={{ marginTop: 10 }}
                  />
                )}

                <div style={{ marginTop: 20, textAlign: "right" }}>
                  <Button
                    label="Back"
                    className="p-button-secondary"
                    onClick={() => setStep("template")}
                    style={{ marginRight: 10 }}
                  />
                  <Button label="Submit" onClick={createPage} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Template Preview */}
        <div style={{ flex: 1.5, height: "80vh" }}>
          {selectedTemplate ? (
            <>
              <h4>Template Preview</h4>
              <iframe
                src={selectedTemplate.EncodedAbsUrl}
                title="Template Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                border: "1px dashed #ccc",
              }}
            >
              No template selected
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
};
