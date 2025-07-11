/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import { sp } from "@pnp/sp";
import { INewsItem, IThumbnail } from "../../Interface/NewsInterface";

const fetchNewsItems = async (setNewsItems: any, Type?: any) => {
  const thumbnailItems = await sp.web.lists
    .getByTitle("thumbnailAttachments")
    .items.expand("File")
    .get();
  const thumbnails: IThumbnail[] = thumbnailItems.map((f) => ({
    id: f.Id,
    fileName: f.File.Name,
    url: f.File.ServerRelativeUrl,
  }));
  let pages;
  if (Type === "View") {
    pages = await sp.web.lists
      .getByTitle("Site Pages")
      .items.orderBy("ID", false)
      .filter("PageType eq 'NewsPage'")
      .expand("ThumbnailAttachmentsOf")
      .select(
        "*,Title,FileRef,EncodedAbsUrl,ServerRedirectedEmbedUri,UniqueId,ThumbnailAttachmentsOf/ID"
      )
      .top(5000)
      .get();
  } else {
    pages = await sp.web.lists
      .getByTitle("Site Pages")
      .items.orderBy("ID", false)
      .filter("PageType eq 'NewsPage'")
      .expand("ThumbnailAttachmentsOf")
      .select(
        "*,Title,FileRef,EncodedAbsUrl,ServerRedirectedEmbedUri,UniqueId,ThumbnailAttachmentsOf/ID"
      )
      .top(3)
      .get();
  }

  console.log("items of sitepages", pages);
  const items: INewsItem[] = await pages.map((page) => ({
    id: page.Id,
    title: page.Title,
    description: page.Description,
    thumbnail:
      thumbnails.find((t) => t.id === page.ThumbnailAttachmentsOfId) || null,
    siteUrl: page?.EncodedAbsUrl,
  }));

  setNewsItems(items);
};
const uploadThumbnail = async (thumbnail: any) => {
  if (!thumbnail.file) return null;
  const fileAddResult = await sp.web
    .getFolderByServerRelativeUrl("ThumbnailAttachments")
    .files.addUsingPath(thumbnail.fileName, thumbnail.file, {
      Overwrite: true,
    });
  const item = await (await fileAddResult.file.getItem())();
  return item?.Id;
};
const getLibraryFileDetails = async (itemId: number) => {
  try {
    const libItem = await sp.web.lists
      .getByTitle("ThumbnailAttachments")
      .items.getById(itemId)
      .select("FileLeafRef", "FileRef")();
    return {
      fileName: libItem.FileLeafRef,
      url: `${window.location.origin}${libItem.FileRef}`,
    };
  } catch (err) {
    console.error("Error fetching library file", err);
    return null;
  }
};
// const addThumbnail = (): void => {
//     sp.web
//       .getFolderByServerRelativePath("Thumbnail")
//       .files.add(
//         templatePopup.thumbnail.fileName,
//         templatePopup.thumbnail.file,
//         true
//       )
//       .then((_res: any) => {
//         sp.web
//           .getFileByServerRelativeUrl(_res.data.ServerRelativeUrl)
//           .getItem("Title", "ID")
//           .then((_response: any) => {
//             AddSitePage(_response.Id);
//           })
//           .catch((err) => errorFunction(err, "getThumbnailId"));
//       })
//       .catch((err) => errorFunction(err, "addThumbnail"));
//   };
//    const errorFunction = (err: any, func: string): void => {
//     console.log(err, `News & Announcemnt Add-${func}`);
//   };
export { fetchNewsItems, uploadThumbnail, getLibraryFileDetails };
