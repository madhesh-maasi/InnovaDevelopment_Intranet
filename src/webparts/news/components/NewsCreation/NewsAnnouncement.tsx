import * as React from "react";
import { useEffect, useState } from "react";
import { sp, Web } from "@pnp/sp/presets/all";
import { Label, Icon, PrimaryButton, TextField } from "@fluentui/react";
import styles from "./NewsAnnouncement.module.scss";

import * as moment from "moment";
import { Sidebar } from "primereact/sidebar";

// Interfaces
interface IUser {
  id: number;
  name: string;
  email: string;
}
interface IADGroup {
  key: number[] | string;
  displayName: string;
}
interface ITemplatePopup {
  condition: boolean;
  panelMode: "new" | "edit";
  targetId: number | null;
  selectedTemplate: any;
  toShowPanel: "templateSelection" | "siteDetails";
  siteName: string;
  targetAudience: IADGroup[];
  status: string;
  loader: boolean;
  errorMsg: string;
  deptApprover: string;
  tag: string;
  typeOfContent: string;
  thumbnail: IThumbnail;
  intranetSync: boolean;
  publishDate: Date;
}
interface IData {
  id: number | null;
  name: string;
  url: string;
  bannerImageUrl: string;
  description: string;
  siteType: string;
  targetAudience: IADGroup[];
  status: string;
  isDelete: boolean;
  isVisible: boolean;
  LikeCount: number;
  ViewCount: number;
  UniqueId: string;
  deptApprover: string;
  tag: string;
  thumbnail: IThumbnail;
  intranetSync: boolean;

  publishDate: Date;
}
interface IThumbnail {
  Id: number | null;
  serverRelativeUrl: string;
  fileName: string;
  file: any;
}

interface IProps {
  context: any;
}

let start: number = 0;

const NewsAnnouncement = (props: IProps): JSX.Element => {
  // Local Variables
  const spWeb = Web(props.context.pageContext.web.absoluteUrl);
  const domaninUrl: string =
    props.context._pageContext.site.absoluteUrl.split("/sites")[0];
  const webUrl: string = props.context._pageContext.web.absoluteUrl;
  const webServerUrl: string = props.context._pageContext.web.serverRelativeUrl;
  const webId: string = props.context._pageContext.web.id;
  const siteId: string = props.context._pageContext.site.id;
  const _thumbnail: IThumbnail = {
    Id: null,
    file: null,
    fileName: "",
    serverRelativeUrl: "",
  };
  const _templatePopup: ITemplatePopup = {
    condition: false,
    panelMode: "new",
    targetId: null,
    selectedTemplate: null,
    toShowPanel: "templateSelection",
    siteName: "",
    status: "Active",
    targetAudience: [],
    loader: false,
    errorMsg: "",
    deptApprover: "HR",
    tag: "",
    typeOfContent: "",
    thumbnail: _thumbnail,
    intranetSync: false,

    publishDate: new Date(),
  };

  // States
  const [news, setNews] = useState<IData[]>([]);
  const [newsSplice, setNewsSplice] = useState<IData[]>([]);
  const [newsTemplate, setNewsTemplate] = useState<IData[]>([]);
  const [templatePopup, setTemplatePopup] =
    useState<ITemplatePopup>(_templatePopup);
  const [inProcess, SetInProcess] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(true);

  //  All Functions

  const getCurrentUser = (): void => {
    sp.web
      .currentUser()
      .then((user) => {
        let _user: IUser = {
          id: user.Id,
          name: user.Title ? user.Title : "",
          email: user.Email
            ? user.Email.toLowerCase()
            : user.UserPrincipalName
            ? user.UserPrincipalName.toLowerCase()
            : "",
        };
        getThumbnails(_user);
      })
      .catch((err: any) => errorFunction(err, "getCurrentUser"));
  };

  const getThumbnails = (curuser: IUser): void => {
    sp.web.lists
      .getByTitle("Thumbnail")
      .items.expand("File")
      .top(5000)
      .get()
      .then((_file: any) => {
        let _tempThumbnail: IThumbnail[] = [];
        for (const _f of _file) {
          _tempThumbnail.push({
            Id: _f.Id,
            fileName: _f.File.Name,
            serverRelativeUrl: _f.File.ServerRelativeUrl,
            file: null,
          });
        }
        getSitePages(curuser, _tempThumbnail);
      })
      .catch((err: any) => errorFunction(err, "getThumbnails"));
  };
  // optimized code
  const getSitePages = async (
    curUser: IUser,
    _files: IThumbnail[]
  ): Promise<void> => {
    try {
      const items: any[] = await spWeb.lists
        .getByTitle("Site Pages")
        .items.filter("SiteType ne null and OData__ModerationStatus eq 0")
        .select(
          "*,Title,FileRef,EncodedAbsUrl,ServerRedirectedEmbedUri,UniqueId"
        )
        .orderBy("ID", false)
        .top(5000)
        .get();

      if (!items.length) {
        setNews([]);
        setNewsTemplate([]);
        setNewsSplice([]);
        setLoader(false);
        return;
      }

      const findAttachment = (ThumbnailId: number): IThumbnail =>
        _files.find((_f) => _f.Id === ThumbnailId) || _thumbnail;

      const _items = items.filter(
        ({ OData__UIVersionString, SiteType, TargetAudiencesId }) =>
          OData__UIVersionString !== "0.1" &&
          (SiteType === "Templates" || ["News"].includes(SiteType))
      );

      const _data: IData[] = _items.map((item) => ({
        id: item.Id,
        name: item.Title,
        url: item.EncodedAbsUrl,
        bannerImageUrl: item.BannerImageUrl?.Url || "",
        description: item.Description || "",
        siteType: item.SiteType,
        targetAudience: item.TargetAudiencesId || [],
        status: item.IsVisible ? "Active" : "Inactive",
        isDelete: !!item.IsDelete,
        isVisible: !!item.IsVisible,
        LikeCount: 0,
        ViewCount: 0,
        UniqueId: item.UniqueId,
        deptApprover: item.Department || "",
        tag: item.Tag || "",
        thumbnail: findAttachment(item.ThumbnailId),
        intranetSync: !!item.IntranetSync,
        publishDate: new Date(item.PublishDate || item.Created),
      }));

      const sortedData = sortFunction(_data, "publishDate", false);
      const _news = sortedData.filter(
        ({ isDelete, isVisible, siteType }) =>
          !isDelete && isVisible && ["News"].includes(siteType)
      );
      const _newsTemplate = sortedData.filter(
        ({ siteType }) => siteType === "Templates"
      );

      setNews(_news);
      setNewsTemplate(_newsTemplate);

      const tempNewsSplice = _news.slice(0, 4);

      setNewsSplice(tempNewsSplice);

      await getPageLikes(tempNewsSplice);
    } catch (err) {
      console.error("getSitePages Error:", err);
      setLoader(false);
    } finally {
      setLoader(false);
    }
  };

  const sortFunction = (
    _data: IData[],
    key: string,
    isAsc: boolean
  ): IData[] => {
    return [..._data].sort((a: any, b: any) => {
      if (!isAsc) {
        let c = a;

        a = b;
        b = c;
      }
      return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    });
  };

  // const getPageLikes = (_announcement: IData[]): void => {
  //   for (let i = 0; i < _announcement.length; i++) {
  //     let _a: IData = _announcement[i];

  //     sp.web.lists
  //       .getByTitle("Site Pages")
  //       .items.getById(_a.id)
  //       .getLikedByInformation()
  //       .then((items) => {
  //         _a.LikeCount = Number(items.likeCount);
  //       })
  //       .catch((err: any) => {
  //         console.log(err, "Site pages get Likes error");
  //         setLoader(false);
  //       });
  //   }

  //   getPageViews(_announcement);
  // };
  const getPageLikes = async (_announcement: IData[]): Promise<void> => {
    try {
      const likePromises = _announcement.map(async (_a: any) => {
        try {
          const items = await sp.web.lists
            .getByTitle("Site Pages")
            .items.getById(_a.id)
            .getLikedByInformation();
          _a.LikeCount = Number(items.likeCount);
        } catch (err) {
          console.error("Site pages get Likes error:", err);
        }
      });

      await Promise.all(likePromises);
      getPageViews(_announcement);
    } catch (err) {
      console.error("Error fetching page likes:", err);
    } finally {
      setLoader(false);
    }
  };

  const getPageViews = async (_announcement: IData[]): Promise<void> => {
    try {
      const pageData = await sp.web.lists
        .getByTitle("Site Pages")
        .select("Id")();

      let SitePageID = pageData.Id;

      const viewPromises = _announcement.map(async (_a) => {
        let getAnalyticsUrl = `${webUrl}/_api/v2.1${webServerUrl},${siteId},${webId}/lists/${SitePageID}/items/${_a.UniqueId}/driveItem?$select=id,analytics&$expand=analytics($expand=allTime)`;

        try {
          const response = await fetch(getAnalyticsUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const jsonRes = await response.json();

          _a.ViewCount = jsonRes.analytics?.allTime?.access
            ? Number(jsonRes.analytics.allTime.access.actionCount)
            : 0;
        } catch (err) {
          console.error("Site pages get Views response error:", err);
        }
      });

      await Promise.all(viewPromises);

      let _tempAnnouncement = sortFunction(_announcement, "publishDate", false);

      console.log(
        `${((performance.now() - start) / 1000).toFixed(
          2
        )} seconds - News/Announcements - HR`
      );

      setNewsSplice(_tempAnnouncement);
    } catch (err) {
      console.error("Site pages get Views error:", err);
    } finally {
      setLoader(false);
    }
  };

  const panelOnChangeHandler = (key: string, value: any): void => {
    let _templatePopupOnChange: any = { ...templatePopup };

    _templatePopupOnChange.errorMsg = "";

    if (key == "selectedTemplate") {
      if (
        _templatePopupOnChange.selectedTemplate == null ||
        _templatePopupOnChange.selectedTemplate.id != value.id
      ) {
        _templatePopupOnChange.loader = true;
        _templatePopupOnChange.selectedTemplate = value;
      }
    } else if (key == "thumbnail") {
      _templatePopupOnChange[key].file = value[0];
      _templatePopupOnChange[key].fileName = value[0].name;
    } else if (key == "targetAudience") {
      if (value.length) {
        _templatePopupOnChange[key] = value;
      } else {
        _templatePopupOnChange[key] = [];
      }
    } else {
      _templatePopupOnChange[key] = value;
    }

    setTemplatePopup({
      ..._templatePopupOnChange,
    });
  };

  const validationFunction = (): void => {
    let _error: string = "";
    let _templatePopupValidation: ITemplatePopup = { ...templatePopup };

    if (!_templatePopupValidation.siteName.trim()) {
      _error = "Title is mandatory";
    } else if (_templatePopupValidation.typeOfContent == "") {
      _error = "Type of content mandatory";
    } else if (_templatePopupValidation.deptApprover == "") {
      _error = "Department Approver is mandatory";
    } else if (_templatePopupValidation.tag == "") {
      _error = "Tag is mandatory";
    } else if (_templatePopupValidation.thumbnail.file == null) {
      _error = "Thumbnail is mandatory";
    }

    if (_error) {
      SetInProcess(false);
      setTemplatePopup({ ..._templatePopupValidation, errorMsg: _error });
    } else {
      if (_templatePopupValidation.panelMode == "new") {
        addThumbnail();
      }
    }
  };

  const addThumbnail = (): void => {
    sp.web
      .getFolderByServerRelativePath("Thumbnail")
      .files.add(
        templatePopup.thumbnail.fileName,
        templatePopup.thumbnail.file,
        true
      )
      .then((_res: any) => {
        sp.web
          .getFileByServerRelativeUrl(_res.data.ServerRelativeUrl)
          .getItem("Title", "ID")
          .then((_response: any) => {
            AddSitePage(_response.Id);
          })
          .catch((err) => errorFunction(err, "getThumbnailId"));
      })
      .catch((err) => errorFunction(err, "addThumbnail"));
  };

  const AddSitePage = async (thumbnailId: number) => {
    let _templateUrl: string = templatePopup?.selectedTemplate.url
      .split(domaninUrl)
      .slice(-1)[0];
    let _title: string = templatePopup.siteName.trim();

    sp.web.currentUser
      .get()
      .then(async (user) => {
        await sp.web
          .ensureUser(user.LoginName)
          .then(async (_user) => {
            let source = await sp.web.loadClientsidePage(_templateUrl);
            let _pageName = _title;

            let dest: any = await sp.web.addClientsidePage(
              _pageName,
              _pageName,
              "Article"
            );

            let _targetId = dest["json"].Id;

            await source.copyTo(dest, false);

            const page: any = await sp.web.loadClientsidePage(
              dest["json"].AbsoluteUrl.split(window.location.origin).slice(
                -1
              )[0]
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
              // await titleWebPart.setProperties({
              //   title: _pageName,
              //   authorByline: [_user.data.Email],
              // });
              await titleWebPart.column.remove();
            }

            await page.save(false);

            await sp.web.lists
              .getByTitle("Site Pages")
              .items.getById(_targetId)
              .update({
                IsVisible: templatePopup.status == "Active" ? true : false,
                SiteType: templatePopup.typeOfContent,
                Department: templatePopup.deptApprover,
                Tag: templatePopup.tag,
                TemplateId: templatePopup.selectedTemplate.id,
                TargetAudiencesId: {
                  results:
                    templatePopup.targetAudience.length > 0
                      ? templatePopup.targetAudience.map((user) => user.key)
                      : [],
                },
                ThumbnailId: thumbnailId,
                IntranetSync: templatePopup.intranetSync,

                PublishDate: moment(templatePopup.publishDate).format(
                  "MM/DD/YYYY"
                ),
              })
              .then(async () => {
                await window.open(
                  `${page["json"].AbsoluteUrl}?Mode=Edit`,
                  "_blank"
                );
                resetFunction();
              })
              .catch((err) => errorFunction(err, "Addsitepage"));
          })
          .catch((err) => errorFunction(err, "getensureUser"));
      })
      .catch((err) => errorFunction(err, "getcurrentUser"));
  };

  const errorFunction = (err: any, func: string): void => {
    console.log(err, `News & Announcemnt Add-${func}`);
    setLoader(false);
    SetInProcess(false);
  };

  const resetFunction = (): void => {
    setLoader(true);
    SetInProcess(false);
    setTemplatePopup({ ..._templatePopup });
    init();
  };

  const init = (): void => {
    start = performance.now();
    getCurrentUser();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.newsContainer}>
          <div className={styles.headerSection}>
            <div className={styles.left}>
              <h2 className={styles.head}>News & Announcements</h2>
              <Icon
                iconName={"Add"}
                style={{ display: "block" }}
                onClick={() => {
                  if (!loader) {
                    let _data: IData[] = newsTemplate.filter((_item: IData) =>
                      _item.name.includes("Blank")
                    );
                    setTemplatePopup({
                      condition: true,
                      panelMode: "new",
                      targetId: null,
                      selectedTemplate: _data?.length && _data[0],
                      toShowPanel: "templateSelection",
                      siteName: "",
                      targetAudience: [],
                      status: "Active",
                      loader: true,
                      errorMsg: "",
                      deptApprover: "HR",
                      tag: "",
                      typeOfContent: "",
                      thumbnail: _thumbnail,
                      intranetSync: false,
                      publishDate: new Date(),
                    });
                  }
                }}
              />
            </div>
          </div>
          {!loader ? (
            <div className={styles.contentSection}>
              {news.length ? (
                <>
                  <div className={styles.contentContainer}>
                    {newsSplice.length === 3 ? (
                      <>
                        <div className={styles.threeNewsFirst}>
                          <div
                            className={styles.bannerImg}
                            onClick={() => {
                              window.open(news[0].url, "_blank");
                            }}
                          >
                            <img
                              src={
                                news[0].thumbnail.serverRelativeUrl
                                  ? news[0].thumbnail.serverRelativeUrl
                                  : "#"
                              }
                            />
                          </div>
                          <div className={styles.newsDetails}>
                            <div className={styles.tagFlex}>
                              <div
                                className={styles.title}
                                onClick={() => {
                                  window.open(news[0].url, "_blank");
                                }}
                              >
                                <Label title={news[0].name}>
                                  {news[0].name}
                                </Label>
                              </div>
                              <div className={styles.tag}>
                                <div title={news[0].tag}>{news[0].tag}</div>
                              </div>
                            </div>

                            <div className={styles.description}>
                              <Label>{news[0].description}</Label>
                            </div>
                            <div className={styles.newsFooter}>
                              <div
                                className={styles.viewMore}
                                onClick={() => {
                                  window.open(news[0].url, "_blank");
                                }}
                              >
                                <span>
                                  View more
                                  <Icon
                                    className={styles.rightArrow}
                                    iconName="DoubleChevronRight8"
                                  />
                                </span>
                              </div>
                              <div className={styles.likeViewIcon}>
                                <div className={styles.viewLike}>
                                  <Icon iconName="View" />
                                  <span>{news[0].ViewCount}</span>
                                </div>
                                <div className={styles.viewLike}>
                                  <Icon
                                    iconName={true ? "Like" : "LikeSolid"}
                                  />
                                  <span>{news[0].LikeCount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.newsSecondThree}>
                          <div className={styles.news}>
                            <div
                              className={styles.bannerImg}
                              onClick={() => {
                                window.open(news[1].url, "_blank");
                              }}
                            >
                              <img
                                src={
                                  news[1].thumbnail.serverRelativeUrl
                                    ? news[1].thumbnail.serverRelativeUrl
                                    : "#"
                                }
                              />
                            </div>
                            <div className={styles.newsDetails}>
                              <div className={styles.tagFlex}>
                                <div
                                  className={styles.title}
                                  onClick={() => {
                                    window.open(news[1].url, "_blank");
                                  }}
                                >
                                  <Label title={news[1].name}>
                                    {news[1].name}
                                  </Label>
                                </div>
                                <div className={styles.tag}>
                                  <div title={news[1].tag}>{news[1].tag}</div>
                                </div>
                              </div>
                              <div className={styles.description}>
                                <Label>{news[1].description}</Label>
                              </div>
                              <div className={styles.newsFooter}>
                                <div
                                  className={styles.viewMore}
                                  onClick={() => {
                                    window.open(news[1].url, "_blank");
                                  }}
                                >
                                  <span>
                                    View more
                                    <Icon
                                      className={styles.rightArrow}
                                      iconName="DoubleChevronRight8"
                                    />
                                  </span>
                                </div>
                                <div className={styles.likeViewIcon}>
                                  <div className={styles.viewLike}>
                                    <Icon iconName="View" />
                                    <span>{news[1].ViewCount}</span>
                                  </div>
                                  <div className={styles.viewLike}>
                                    <Icon
                                      iconName={true ? "Like" : "LikeSolid"}
                                    />
                                    <span>{news[1].LikeCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.news}>
                            <div
                              className={styles.bannerImg}
                              onClick={() => {
                                window.open(news[2].url, "_blank");
                              }}
                            >
                              <img
                                src={
                                  news[2].thumbnail.serverRelativeUrl
                                    ? news[2].thumbnail.serverRelativeUrl
                                    : "#"
                                }
                              />
                            </div>
                            <div className={styles.newsDetails}>
                              <div className={styles.tagFlex}>
                                <div
                                  className={styles.title}
                                  onClick={() => {
                                    window.open(news[2].url, "_blank");
                                  }}
                                >
                                  <Label title={news[2].name}>
                                    {news[2].name}
                                  </Label>
                                </div>
                                <div className={styles.tag}>
                                  <div title={news[2].tag}>{news[2].tag}</div>
                                </div>
                              </div>
                              <div className={styles.description}>
                                <Label>{news[2].description}</Label>
                              </div>
                              <div className={styles.newsFooter}>
                                <div
                                  className={styles.viewMore}
                                  onClick={() => {
                                    window.open(news[2].url, "_blank");
                                  }}
                                >
                                  <span>
                                    View more
                                    <Icon
                                      className={styles.rightArrow}
                                      iconName="DoubleChevronRight8"
                                    />
                                  </span>
                                </div>
                                <div className={styles.likeViewIcon}>
                                  <div className={styles.viewLike}>
                                    <Icon iconName="View" />
                                    <span>{news[2].ViewCount}</span>
                                  </div>
                                  <div className={styles.viewLike}>
                                    <Icon
                                      iconName={true ? "Like" : "LikeSolid"}
                                    />
                                    <span>{news[2].LikeCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      [...news].splice(0, 4).map((item: IData) => {
                        return (
                          <>
                            <div
                              className={
                                newsSplice.length === 1
                                  ? styles.oneNews
                                  : newsSplice.length === 2
                                  ? styles.twoNews
                                  : styles.news
                              }
                            >
                              <div
                                className={styles.bannerImg}
                                onClick={() => {
                                  window.open(item.url, "_blank");
                                }}
                              >
                                <img
                                  src={
                                    item.thumbnail.serverRelativeUrl
                                      ? item.thumbnail.serverRelativeUrl
                                      : "#"
                                  }
                                />
                              </div>
                              <div className={styles.newsDetails}>
                                <div className={styles.tagFlex}>
                                  <div
                                    className={styles.title}
                                    onClick={() => {
                                      window.open(item.url, "_blank");
                                    }}
                                  >
                                    <Label title={item.name}>{item.name}</Label>
                                  </div>
                                  <div className={styles.tag}>
                                    <div title={item.tag}>{item.tag}</div>
                                  </div>
                                </div>
                                <div className={styles.description}>
                                  <Label>{item.description}</Label>
                                </div>
                                <div className={styles.newsFooter}>
                                  <div
                                    className={styles.viewMore}
                                    onClick={() => {
                                      window.open(item.url, "_blank");
                                    }}
                                  >
                                    <span>
                                      View more
                                      <Icon
                                        className={styles.rightArrow}
                                        iconName="DoubleChevronRight8"
                                      />
                                    </span>
                                  </div>
                                  <div className={styles.likeViewIcon}>
                                    <div className={styles.viewLike}>
                                      <Icon iconName="View" />
                                      <span>{item.ViewCount}</span>
                                    </div>
                                    <div className={styles.viewLike}>
                                      <Icon
                                        iconName={true ? "Like" : "LikeSolid"}
                                      />
                                      <span>{item.LikeCount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.noNewsSection}>
                  <Label>{loader ? "Loading News..." : "No News"}</Label>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noNewsSection}>
              <Label>{loader ? "Loading News ..." : "No News"}</Label>
            </div>
          )}
        </div>
      </div>

      <div className="panel-Section">
        <Sidebar
          position="right"
          style={{ width: "90vw" }}
          visible={templatePopup.condition}
          onHide={() => setTemplatePopup({ ..._templatePopup })}
          header={
            <div>
              <Label
                style={{
                  fontSize: 24,
                  lineHeight: "48px",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                News & Announcements Template
              </Label>
            </div>
          }
        >
          <>
            <div style={{ display: "flex", width: "100%" }}>
              {inProcess ? (
                <div
                  style={{
                    backgroundColor: "#fff",
                    width: "100%",
                    height: "90vh",
                  }}
                >
                  {/* <Loading /> */}
                </div>
              ) : (
                <>
                  {templatePopup.toShowPanel == "templateSelection" ? (
                    <div className={styles.templateBox}>
                      <div className={styles.templateAdd}>
                        <Label
                          style={{
                            fontSize: 17,
                            lineHeight: "35px",
                            marginTop: 8,
                            marginBottom: 8,
                          }}
                        >
                          Select Template
                        </Label>

                        <div className={styles.templateContainer}>
                          {newsTemplate.length
                            ? [
                                ...newsTemplate.filter(
                                  (_item: IData) =>
                                    _item.name && _item.name.includes("Blank")
                                ),
                                ...newsTemplate.filter(
                                  (_item: IData) =>
                                    !_item.name.includes("Blank")
                                ),
                              ]
                                .filter((_i: IData) => !_i.isDelete)
                                .map((item: IData) => {
                                  return (
                                    <div
                                      className={
                                        templatePopup.selectedTemplate &&
                                        templatePopup.selectedTemplate.id ==
                                          item.id
                                          ? styles.templateDetailsActive
                                          : styles.templateDetails
                                      }
                                      onClick={() => {
                                        panelOnChangeHandler(
                                          "selectedTemplate",
                                          item
                                        );
                                      }}
                                    >
                                      <img
                                        src={
                                          item.bannerImageUrl
                                            ? item.bannerImageUrl
                                            : " "
                                        }
                                        alt="#"
                                      />
                                      <div className={styles.title}>
                                        <Label title={item.name}>
                                          {item.name}
                                        </Label>
                                      </div>
                                    </div>
                                  );
                                })
                            : "No Templates"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 10,
                        }}
                      >
                        <PrimaryButton
                          onClick={() => {
                            setTemplatePopup({ ..._templatePopup });
                          }}
                        >
                          Cancel
                        </PrimaryButton>
                        <PrimaryButton
                          onClick={() => {
                            if (
                              !templatePopup.loader &&
                              templatePopup.selectedTemplate != null
                            ) {
                              panelOnChangeHandler(
                                "toShowPanel",
                                "siteDetails"
                              );
                            }
                          }}
                        >
                          Next
                        </PrimaryButton>
                      </div>
                    </div>
                  ) : templatePopup.toShowPanel == "siteDetails" ? (
                    <div className={styles.panelScroll}>
                      <div>
                        <Label
                          style={{
                            fontSize: 24,
                            lineHeight: "48px",
                            margin: 0,
                            fontWeight: 600,
                          }}
                        >
                          Site Details
                        </Label>
                      </div>
                      <div
                        className={styles.siteAdd}
                        style={{
                          height: "auto",
                        }}
                      >
                        <div>
                          <TextField
                            label="Title"
                            required
                            placeholder="Enter Title"
                            value={templatePopup.siteName}
                            onChange={(e, text: string) => {
                              panelOnChangeHandler("siteName", text);
                            }}
                          />
                        </div>

                        <div style={{ margin: "10px 0px" }}>
                          <Label required>Thumbnail</Label>
                          <div className={styles.ceoImage}>
                            <div className={styles.image}>
                              <div className={styles.singleFile}>
                                <a
                                  title={
                                    templatePopup.thumbnail.fileName
                                      ? templatePopup.thumbnail.fileName
                                      : ""
                                  }
                                  href={
                                    templatePopup.thumbnail.serverRelativeUrl
                                      ? templatePopup.thumbnail
                                          .serverRelativeUrl
                                      : ""
                                  }
                                  target="_blank"
                                  data-interception="off"
                                >
                                  {templatePopup.thumbnail.fileName
                                    ? templatePopup.thumbnail.fileName
                                    : ""}
                                </a>
                              </div>
                            </div>

                            <div className={styles.fileselectorBtn}>
                              <label
                                htmlFor="filePicker"
                                className={styles.fileBtn}
                                style={{
                                  cursor: "not-allowed",
                                }}
                              >
                                <Icon
                                  iconName="OpenFile"
                                  className={styles.fileIcon}
                                  style={{
                                    marginRight: 6,
                                    cursor: "not-allowed",
                                  }}
                                />
                                <label
                                  htmlFor="filePicker"
                                  style={{
                                    cursor: "not-allowed",
                                  }}
                                >
                                  Upload Image
                                </label>
                              </label>

                              <input
                                type="file"
                                id="filePicker"
                                accept={"image/*"}
                                className={styles.fileStyle}
                                onChange={(e) => {
                                  panelOnChangeHandler(
                                    "thumbnail",
                                    e.target.files
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              margin: "10px 0px",
                              fontWeight: "500",
                              fontSize: 12,
                            }}
                          >
                            Note : The resolution of the uploaded image is 200
                            pixels by 162 pixels.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <div>
                          <Label style={{ color: "#be3939" }}>
                            {templatePopup.errorMsg
                              ? `* ${templatePopup.errorMsg}`
                              : ""}
                          </Label>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <PrimaryButton
                            onClick={() => {
                              setTemplatePopup({ ..._templatePopup });
                            }}
                          >
                            Cancel
                          </PrimaryButton>
                          {templatePopup.panelMode == "new" ? (
                            <PrimaryButton
                              onClick={() => {
                                panelOnChangeHandler(
                                  "toShowPanel",
                                  "templateSelection"
                                );
                              }}
                            >
                              Back
                            </PrimaryButton>
                          ) : null}
                          <PrimaryButton
                            onClick={() => {
                              if (!inProcess) {
                                SetInProcess(true);
                                validationFunction();
                              }
                            }}
                          >
                            {templatePopup.panelMode == "new"
                              ? "Submit"
                              : "Update"}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div style={{ width: "60%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Label
                        style={{
                          fontSize: 17,
                          lineHeight: "35px",
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      >
                        {templatePopup.selectedTemplate &&
                        templatePopup.selectedTemplate.name
                          ? templatePopup.selectedTemplate.name
                          : ""}
                      </Label>
                    </div>

                    <iframe
                      style={{
                        width: "100%",
                        height: "80vh",
                        border: "none",
                        visibility: templatePopup.loader ? "hidden" : "visible",
                      }}
                      id="template=viewer"
                      src={
                        templatePopup.selectedTemplate &&
                        templatePopup.selectedTemplate.url
                          ? templatePopup.selectedTemplate.url
                          : ""
                      }
                      onLoad={(e: any) => {
                        if (
                          templatePopup.selectedTemplate &&
                          templatePopup.selectedTemplate.url
                        ) {
                          const _doc: any =
                            e.target.contentWindow.document.body;

                          const _headerSection = _doc.querySelectorAll(
                            "div [id='SuiteNavWrapper']"
                          );

                          const _targetElement = _doc.querySelectorAll(
                            'div [class="mainContent"] [role="main"]'
                          );

                          const _footerElement = _doc.querySelectorAll(
                            'div [class="mainContent"] [id="CommentsWrapper"]'
                          );

                          for (let i = 0; i < _headerSection.length; i++) {
                            let element: any = _headerSection[i];

                            element.style.pointerEvents = "none";
                            element.style.userSelect = "none";
                          }

                          for (let i = 0; i < _targetElement.length; i++) {
                            let element: any = _targetElement[i];

                            element.style.pointerEvents = "none";
                            element.style.userSelect = "none";
                          }

                          for (let j = 0; j < _footerElement.length; j++) {
                            let element: any = _footerElement[j];

                            element.style.display = "none";
                          }

                          setTemplatePopup((prev) => {
                            return { ...prev, loader: false };
                          });
                          SetInProcess(false);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        </Sidebar>
      </div>
    </>
  );
};

export default NewsAnnouncement;
