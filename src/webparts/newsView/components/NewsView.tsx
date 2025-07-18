/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import styles from "./NewsView.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, Provider } from "react-redux";
import { sp } from "@pnp/sp/presets/all";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
// import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import { store } from "../../../Redux/Store/Store";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { DirectionalHint, TooltipHost } from "@fluentui/react";
import { INewsItem } from "../../../Interface/NewsInterface";
import { fetchNewsItems } from "../../../Services/NewsService/NewsService";
import { AddNewsPanel } from "../../news/components/NewsCreation/AddNewsPanel";
import { INewsViewProps } from "./INewsViewProps";
// import "../assets/css/style.css";
import "../../../Config/style.css";

const News: React.FC<INewsViewProps> = ({ context }) => {
  const dispatch = useDispatch();
  // const imgUrl = require("../assets/wallpaper.jpg");
  const [newsItems, setNewsItems] = useState<INewsItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  console.log("newsItems", newsItems);

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
  useEffect(() => {
    setContext();
    fetchNewsItems(setNewsItems, "View");
  }, []);

  return (
    <div className={styles.newsContainer}>
      <div className={styles.headerWrapper}>
        <CustomHeader Header="News" />
        {/* <CustomaddBtn onClick={() => setShowPanel(true)} /> */}
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
                  <TooltipHost
                    content={item.description}
                    tooltipProps={{
                      directionalHint: DirectionalHint.bottomCenter,
                    }}
                  >
                    <p>{item.description}</p>
                  </TooltipHost>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noRecords}>No News Record Found</div>
        )}
      </div>

      {showPanel && (
        <AddNewsPanel
          context={context}
          onClose={() => {
            setShowPanel(false);
            fetchNewsItems(setNewsItems);
          }}
          setNewsItem={setNewsItems}
        />
      )}
    </div>
  );
};

export default (props: INewsViewProps): JSX.Element => (
  <Provider store={store}>
    <News context={props.context} />
  </Provider>
);
