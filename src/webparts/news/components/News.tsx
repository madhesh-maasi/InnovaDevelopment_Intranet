/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import styles from "./News.module.scss";
import type { INewsProps } from "./INewsProps";
import { useEffect, useState } from "react";
import { useDispatch, Provider, useSelector } from "react-redux";
import { sp } from "@pnp/sp/presets/all";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import { store } from "../../../Redux/Store/Store";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { INewsItem } from "../../../Interface/NewsInterface";
import { fetchNewsItems } from "../../../Services/NewsService/NewsService";
import { AddNewsPanel } from "./NewsCreation/AddNewsPanel";
import "../../../Config/style.css";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
const News: React.FC<INewsProps> = ({ context }) => {
  const dispatch = useDispatch();
  // const imgUrl = require("../assets/wallpaper.jpg");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );

  const [newsItems, setNewsItems] = useState<INewsItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  // console.log("newsItems", newsItems);

  //   const [news, setNews] = useState<any[]>([
  //     {
  //       Title: "Sustainability Initiative Launched",
  //       Description: `Our new Green Workplace Program is now live! This initiative focuses on reducing waste,
  // conserving energy, and promoting eco-friendly practices across all offices and job sites.Our
  // new Green Workplace Program is now live`,
  //       imgUrl: imgUrl,
  //     },
  //     {
  //       Title: "Company Achieves Major Project Milestone",
  //       Description: `We are proud to announce the successful completion of Phase 1 of the XYZ Project ahead of
  // schedule. This achievement reflects our team's dedication and commitment to
  // excellence. We are proud •`,
  //       imgUrl: imgUrl,
  //     },
  //     {
  //       Title: "Welcome New Team Members",
  //       Description: `Please join us in welcoming the latest additions to our team! We're excited to have them on
  // board and look forward to their contributions to our ongoing projects.Please join us in
  // welcoming the latest additions to our team! We're excited to have them on board and look
  // forward to their contributions to our ongoing projects.`,
  //       imgUrl: imgUrl,
  //     },
  //   ]);
  // console.log(setNews);
  const truncateText = (text: any, maxLength: any) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    }
    return text;
  };
  const setContext = async () => {
    try {
      const webUrl = context?.pageContext?.web?.absoluteUrl;
      const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
      const tenantUrl = webUrl?.split("/sites")[0];

      const currentUserDetails = await sp.web.currentUser.get();
      const currentUser = [
        {
          Id: currentUserDetails.Id,
          Email: currentUserDetails.Email,
          DisplayName: currentUserDetails.Title,
          ImgUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${currentUserDetails.Email}`,
        },
      ];

      dispatch(setCurrentUserDetails(currentUser));
      if (webUrl) dispatch(setWebUrl(webUrl));
      if (siteUrl) dispatch(setSiteUrl(siteUrl));
      if (tenantUrl) dispatch(setTenantUrl(tenantUrl));
      dispatch(setMainSPContext(context));
    } catch (err) {
      console.error("Error setting context:", err);
    }
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    setContext();
    fetchNewsItems(setNewsItems);
  }, []);
  useEffect(() => {
    if (currentuser && currentuser.length > 0) {
      checkPermission();
    }
  }, [currentuser]);
  return (
    <>
      <div className={styles.newsContainer}>
        <div className={styles.headerWrapper}>
          <CustomHeader Header="News" />
          {isAdmin ? (
            <CustomaddBtn onClick={() => setShowPanel(true)} />
          ) : (
            <></>
          )}
        </div>
        <div className={styles.newsWrapper}>
          {newsItems.length > 0 ? (
            <div className={styles.newscardsContainer}>
              {newsItems.map((item, index) => (
                <div
                  className={styles.card}
                  key={index}
                  onClick={() => window.open(item.siteUrl, "_blank")}
                >
                  <div className={styles.imgWrapper}>
                    <img src={item.thumbnail?.url} />
                  </div>
                  <div style={{ width: "85%" }}>
                    <div className={styles.title}>{item.title}</div>
                    <p>{truncateText(item.description, 250)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noRecords}>No news found!</div>
          )}
        </div>
        {newsItems.length > 0 ? (
          <div className={styles.seeMoreWrapper}>
            <span
              onClick={() =>
                window.open(
                  `${
                    window.location.origin
                  }${"/sites/InnovaDevelopments/SitePages/NewsView.aspx"}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              see more
            </span>
          </div>
        ) : (
          <div></div>
        )}

        {showPanel && (
          <AddNewsPanel
            context={context}
            onClose={(setLoading?: any) => {
              setShowPanel(false);
              setLoading(false);
              fetchNewsItems(setNewsItems);
            }}
            setNewsItem={setNewsItems}
          />
        )}
      </div>
    </>
  );
};

export default (props: INewsProps): JSX.Element => (
  <Provider store={store}>
    <News context={props.context} />
  </Provider>
);
