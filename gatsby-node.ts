import { GatsbyNode } from "gatsby";

const path: any = require('path');

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
exports.onCreateWebpackConfig = ({ actions }: any) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules


  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        // '@config': path.resolve(__dirname, 'src/config'),
        // '@fonts': path.resolve(__dirname, 'src/fonts'),
        // '@hooks': path.resolve(__dirname, 'src/hooks'),
        // '@images': path.resolve(__dirname, 'src/images'),
        // '@pages': path.resolve(__dirname, 'src/pages'),
        // '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
  });
};

exports.createPages = async ({
  graphql,
  actions,
  reporter,
}: any) => {
  const postsPerPage = parseInt(process?.env?.GATSBY_POST_PER_PAGE as string)
  const BlogTemplate = path.resolve('./src/templates/blog.tsx')
  const mainPage = path.resolve('./src/templates/home.tsx')
  const categoryPage = path.resolve('./src/templates/category.tsx')
  const result = await graphql(`
  {
    allSanityBlog {
      nodes {
        id
        slug {
          current
        }
        categories {
          name
        }
      }
    }
    allSanityCategory{
      nodes {
          _id
          slug {
            current
          }
          name
      }
    }
  }
  `
  );
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }
  const blogs = result?.data?.allSanityBlog?.nodes;
  const categories = result?.data?.allSanityCategory?.nodes;

  // single blogs pages
  blogs?.forEach((blog: any) => {
    actions.createPage({
      path: `/blogs/${blog?.slug?.current}`,
      component: BlogTemplate,
      context: {
        id: blog?.id,
        categories: blog?.categories?.map((category: any) => category?.name)
      },
    });
  }
  );

  // blogs paginated pages
  const totalBlogListPages = Math.ceil(blogs.length / postsPerPage);
  Array.from({ length: totalBlogListPages }).forEach((_, index) => {
    actions.createPage({
      path: index === 0 ? `/` : `/${index + 1}`,
      // path: '/:page',
      component: mainPage,
      context: {
        limit: postsPerPage,
        offset: index * postsPerPage,
        numberOfPages: totalBlogListPages,
        currentPage: index + 1,
      },
    });
  });

  // categories pages
  const createCategoryPages = (category: string, basePath: string) => {
    const filteredBlogs = blogs?.filter((blog: any) => blog?.categories?.some((categoryItem: Queries.SanityCategory) => categoryItem?.name === category));
    const totalBlogListPages = Math.ceil(filteredBlogs.length / postsPerPage);

    Array.from({ length: totalBlogListPages }).forEach((_, index) => {
      actions.createPage({
        path: index === 0 ? `/${basePath.toLowerCase()}` : `/${basePath.toLowerCase()}/${index + 1}`,
        component: categoryPage,
        context: {
          limit: postsPerPage,
          offset: index * postsPerPage,
          numberOfPages: totalBlogListPages,
          currentPage: index + 1,
          category
        },
      });
    });
  };

  // generate categories pages
  categories?.forEach((category: any) => {
    createCategoryPages(category?.name, category?.slug?.current);
  });
};
