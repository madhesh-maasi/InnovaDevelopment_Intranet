/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Message } from "primereact/message";
import { ColumnControl, sp } from "@pnp/sp/presets/all";
import { ProgressSpinner } from "primereact/progressspinner";
// import * as moment from "moment";
import { Toast } from "primereact/toast";
import {
  getLibraryFileDetails,
  uploadThumbnail,
} from "../../../../Services/NewsService/NewsService";
import "./AddNewsPanel.css";
import { INewsItem, INewsTemplate } from "../../../../Interface/NewsInterface";
import CustomHeader from "../../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import DefaultButton from "../../../../CommonComponents/Buttons/DefaultButton/DefaultButton";
import CustomInputField from "../../../../CommonComponents/CustomInputField/CustomInputField";
import CustomDateTimePicker from "../../../../CommonComponents/CustomDateTimePicker/CustomDateTimePicker";
import CustomFileUpload from "../../../../CommonComponents/CustomFileUpload/CustomFileUpload";
interface IProps {
  context: any;
  onClose: any;
  setNewsItem: any;
}
export const AddNewsPanel: React.FC<IProps> = ({
  context,
  onClose,
  setNewsItem,
}) => {
  const domainUrl: string =
    context._pageContext.site.absoluteUrl.split("/sites")[0];
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"template" | "form">("template");
  const [templates, setTemplates] = useState<INewsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const toastRef = React.useRef<any>(null);
  const [newsForm, setNewsForm] = useState<INewsTemplate>({
    Title: "",
    StartDate: new Date(),
    EndDate: new Date(),
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
      // console.log("Loaded Templates:", formattedTemplates);
    } catch (e) {
      console.error("Error loading templates", e);
    }
  };

  const createPage = async () => {
    debugger;
    // console.log("news Form Data", newsForm);

    try {
      setError("");
      // Basic validation
      if (
        !newsForm?.Title?.trim() ||
        !newsForm?.StartDate ||
        !newsForm?.EndDate ||
        !newsForm?.Thumbnail
      ) {
        setError("Please fill out all required fields before submitting.");
        toastRef.current?.show({
          severity: "warn",
          summary: "Missing Fields",
          detail: "Please fill out all required fields before submitting.",
          life: 3000,
        });
        return;
      }
      const start = new Date(newsForm.StartDate);
      const end = new Date(newsForm.EndDate);

      if (start >= end) {
        console.warn("Start Date must be before End Date.");
        setError("Start Date must be before End Date.");
        toastRef.current?.show({
          severity: "warn",
          summary: "Wrong details",
          detail: "Start Date must be before End Date",
          life: 3000,
        });
        return;
      }
      setLoading(true);
      // Upload thumbnail
      const thumbId = await uploadThumbnail(newsForm.Thumbnail);
      if (!thumbId) {
        setError("Failed to upload thumbnail");
        toastRef.current?.show({
          severity: "error",
          summary: "Failed",
          detail: "Failed to upload thumbnail",
          life: 3000,
        });
        return;
      }
      if (!selectedTemplate?.EncodedAbsUrl) {
        setError("Selected template does not have a valid URL.");
        return;
      }

      const _templateUrl =
        selectedTemplate.EncodedAbsUrl.split(domainUrl).slice(-1)[0];
      let _pageName = newsForm.Title.trim();

      sp.web.currentUser.get().then(async (user: any) => {
        let source = await sp.web.loadClientsidePage(_templateUrl);

        let dest: any = await sp.web.addClientsidePage(
          _pageName,
          _pageName,
          "Article"
        );

        let _targetId = dest["json"].Id;

        await source.copyTo(dest, false);

        const page: any = await sp.web.loadClientsidePage(
          dest["json"].AbsoluteUrl.split(window.location.origin).slice(-1)[0]
        );
        const destsiteUrl = dest["json"].AbsoluteUrl;
        await page.setBannerImage(source.bannerImageUrl);
        await page.setAuthorById(user.Id);

        const titleWebPart: ColumnControl<any> = await page.findControl(
          (c: any) => {
            return (
              c["json"].position.zoneIndex == 1 &&
              (c["title"] === "Title area" || c["title"] === "Banner")
            );
          }
        );

        if (titleWebPart.column) {
          await titleWebPart.column.remove();
        }

        await page.save(false);

        // const pageItem = await sp.web.lists
        //   .getByTitle("Site Pages")
        //   .items.filter(`FileLeafRef eq '${_pageName}'`)
        //   .top(1)
        //   .get();

        // if (!pageItem.length) {
        //   setError("Failed to find the page item to update metadata.");
        //   return;
        // }
        const item = sp.web.lists
          .getByTitle("Site Pages")
          .items.getById(_targetId);
        // Step 2: Update other fields using update()
        await item
          .update({
            Title: newsForm.Title,
            StartDate: newsForm.StartDate ? newsForm.StartDate : null,
            EndDate: newsForm.EndDate ? newsForm.EndDate : null,
            ThumbnailAttachmentsOfId: thumbId,
            PageType: "NewsPage",
          })
          .then(async (updatedNews: any) => {
            toastRef?.current?.show({
              severity: "success",
              summary: "Success",
              detail: "News Page created successfully!",
              life: 3000,
            });
            console.log("Updated News", updatedNews);
            setNewsItem((prevItems: INewsItem[]) => [
              ...prevItems,
              {
                id: _targetId,
                title: newsForm.Title,
                description: updatedNews?.data?.Description,
                thumbnail: {
                  id: thumbId,
                  fileName: newsForm?.Thumbnail?.fileName || "",
                  url: newsForm?.Thumbnail?.url,
                },
                siteUrl: destsiteUrl,
              },
            ]);
            await window.open(
              `${page["json"].AbsoluteUrl}?Mode=Edit`,
              "_blank"
            );
            onClose(setLoading);
          });
      });
    } catch (err) {
      console.error("Error creating news page", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <>
      <Toast ref={toastRef} position="top-left" baseZIndex={9999} />
      <Sidebar
        position="right"
        visible
        onHide={onClose}
        style={{ width: "90vw" }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              height: "100%",
              justifyContent: "center",
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <ProgressSpinner />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Left Column */}
            <div style={{ flex: 1 }}>
              {step === "template" ? (
                <>
                  <CustomHeader Header="Select Template" />
                  <div className="newstemplateContainer">
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {templates.map((tmpl) => (
                        <div
                          key={tmpl.Id}
                          className="card"
                          style={{
                            border: selectedTemplate
                              ? "2px solid #0471af"
                              : "none !important",
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
                            <div className="title">{tmpl.Title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="buttonFooter">
                      <DefaultButton
                        text="Next"
                        btnType="primaryBtn"
                        disabled={!selectedTemplate}
                        onClick={() => setStep("form")}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <CustomHeader Header="Fill News Details" />
                  <div className="newstemplateContainer">
                    <div className="p-fluid">
                      <CustomInputField
                        label="Title*"
                        value={newsForm?.Title || ""}
                        placeholder="Enter Title"
                        onChange={(e) =>
                          setNewsForm((prev) => ({
                            ...prev,
                            Title: e.target.value,
                          }))
                        }
                      />
                      <CustomDateTimePicker
                        value={newsForm?.StartDate}
                        onChange={(date) =>
                          setNewsForm((prev: any) => ({
                            ...prev,
                            StartDate: date || "",
                          }))
                        }
                        label="Start Date"
                        withLabel={true}
                      />

                      <CustomDateTimePicker
                        value={newsForm?.EndDate}
                        onChange={(date) =>
                          setNewsForm((prev: any) => ({
                            ...prev,
                            EndDate: date || "",
                          }))
                        }
                        label="End Date*"
                        withLabel={true}
                      />

                      <CustomFileUpload
                        accept="image/*"
                        label="Upload Thumbnail*"
                        onFileSelect={(file: File | null) => {
                          if (!file) return;

                          setNewsForm((prev) => ({
                            ...prev!,
                            Thumbnail: {
                              ...prev?.Thumbnail,
                              fileName: file.name,
                              url: URL.createObjectURL(file),
                              file: file,
                            },
                          }));
                        }}
                      />

                      {newsForm?.Thumbnail?.fileName && (
                        <div style={{ marginTop: 8 }}>
                          <i className="pi pi-image" />{" "}
                          {newsForm.Thumbnail.fileName}
                        </div>
                      )}

                      {error && (
                        <Message
                          severity="error"
                          text={error}
                          style={{ marginTop: 10 }}
                        />
                      )}
                    </div>
                    <div className="buttonFooter">
                      <DefaultButton
                        text="Back"
                        btnType="closeBtn"
                        onClick={() => {
                          setError("");
                          setStep("template");
                          setNewsForm({
                            Title: "",
                            StartDate: new Date(),
                            EndDate: new Date(),
                            Thumbnail: { fileName: "", url: "", file: null },
                          });
                        }}
                      />
                      <DefaultButton
                        text="Submit"
                        btnType="primaryBtn"
                        onClick={createPage}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Template Preview */}
            <div style={{ flex: 1.5, height: "88vh" }}>
              {selectedTemplate ? (
                <>
                  <CustomHeader Header="Template Preview" />
                  <iframe
                    src={selectedTemplate.EncodedAbsUrl}
                    title="Template Preview"
                    className="iframeContainer"
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
        )}
      </Sidebar>
    </>
  );
};
