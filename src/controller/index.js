import DanbooruUrls from "../lib/BaseUrls";
import page from "@/app/post/page";

class ControllerApi {


  async GetPost(url) {
    try {
      let urls = process.env.URL_POST;

      const queryString = url.split("?")[1];
      const dataSplitUrl = queryString ? queryString.split("&") : [];
      const queryParams = dataSplitUrl.reduce((acc, param) => {
        const [key, value] = param.split("=");
        acc[key] = value || "";
        return acc;
      }, {});

      const { tags, page, limit, includeOffset } = queryParams;
      const updatedTags = tags && tags.includes('rating:safe') ? tags.replace('rating:safe', 'rating:general') : tags;

      if (updatedTags) {
        urls += `&tags=${updatedTags}`;
      }
      if (page) {
        urls += `&pid=${page - 1}`;
      }
      if (limit) {
        urls += `&limit=${limit}`;
      }

      const response = await fetch(`${DanbooruUrls}${urls}`);
      if (!response.ok) {
        throw { code: response.code }; // Handle non-200 responses
      }

      const data = await response.json();
      console.log(`${DanbooruUrls}${urls}`)
      if (!data || !data.post) { // Check for the expected structure
        throw { code: 404 };
      }
      if(includeOffset){
        return data
      }

      return data.post;
    } catch (err) {
      console.log(err); // Log the error for debugging
      throw err;
    }
  }

  async GetTags(url) {
    try {
      const queryString = url.split("?")[1];
      const dataSplitUrl = queryString ? queryString.split("&") : [];
      const queryParams = dataSplitUrl.reduce((acc, param) => {
        const [key, value] = param.split("=");
        acc[key] = value || "";
        return acc;
      }, {});
      let urls = process.env.URL_TAGS;
      const { names,limit,orderBy,order,search, includeOffset,page } = queryParams;
      if (names) {
        urls += `&names=${names}`;
      }
      if (limit) {
        urls += `&limit=${limit}`;
      }
      if (orderBy) {
        urls += `&orderBy=${orderBy}`
      }  ``
      if (order) {
        urls += `&order=${order}`
      }
      if (search) {
        urls += `&name_pattern=%${search}%`
      }
      if (page){
        urls += `&pid=${page}`
      }
      const res = await fetch(`${DanbooruUrls}${urls}`)
      if (!res.ok) {
        throw {code: 403}
      }
      const data = await res.json()
      if (!data.tag) {
        throw { code: 404 }
      }


      if(includeOffset){
        return data
      }else {
      return data.tag
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async GetPostId(id) {
    try {
      if (!id){
        throw { code: 404 };
      }
      let urls = process.env.URL_POST_ID + id;
      const res = await fetch(`${DanbooruUrls}${urls}`)
      const data = await res.json()
      if (!data) {
        throw {code: 404}
      }
      return data.post
    } catch (err) {
      throw err
    }
   }
}

export default new ControllerApi();