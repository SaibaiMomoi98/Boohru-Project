import DanbooruUrls from "../lib/BaseUrls";

class ControllerApi {


  async GetPost(url) {
    let urls = process.env.URL_POST;
    if (url.includes("?")) {
      const queryString = url.split("?")[1];
      const dataSplitUrl = queryString ? queryString.split("&") : [];
      const queryParams = dataSplitUrl.reduce((acc, param) => {
        const [key, value] = param.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
        return acc;
      }, {});
      const { tags, page, limit } = queryParams;
      const updatedTags = tags.includes('rating:safe') ? tags.replace('rating:safe', 'rating:general') : tags;
      if (tags) {
        urls += `&tags=${updatedTags}`;
      }
      if (page) {
        urls += `&pid=${page - 1}`;
      }
      if (limit) {
        urls += `&limit=${limit}`;
      }
    }
    try {
      const response = await fetch(`${DanbooruUrls}${urls}`);
      const data = await response.json();
      console.log(data.post === undefined);
      
      if (data.post === undefined) {
        throw {code: 404}
      }
      return data
    } catch (err) {
      throw err
    }
  }

  async GetTags(url) {
    try {
      console.log(url);
      const queryString = url.split("?")[1];
      const dataSplitUrl = queryString ? queryString.split("&") : [];
      const queryParams = dataSplitUrl.reduce((acc, param) => {
        const [key, value] = param.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
        return acc;
      }, {});
      let urls = process.env.URL_TAGS;
      const { names,limit,orderBy,order } = queryParams;
      if (names) {
        urls += `&names=${names}`; 
      }
      if (limit) {
        urls += `&limit=${limit}`; 
      }
      if (orderBy) {
        urls += `&orderBy=${orderBy}`
      }  
      if (order) {
        urls += `&order=${order}`
      } 
      const res = await fetch(`${DanbooruUrls}${urls}`)      
      const data = await res.json()
      console.log(data);
      
      if (!data.tag) {
        throw { code: 404 }
      }
      return data
    } catch (err) {
      throw err
    }
  }

  async GetPostId(id) {
    try {
      let urls = process.env.URL_POST_ID + id;
      const res = await fetch(`${DanbooruUrls}${urls}`)
      const data = await res.json()
      if (!data) {
        throw {code: 404}
      }
      return data
    } catch (err) {
      throw err
    }
   }
}

export default new ControllerApi();