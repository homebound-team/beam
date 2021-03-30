import { Meta } from "@storybook/react";
import { navLink } from "src/components";

export default {
  title: "Foundations/Links",
} as Meta<any>;

export const Links = () => {
  return (
    <>
      <div>
        <a href="http://www.homebound.com">Homebound</a>
      </div>
      <div>
        <a href={`http://www.homebound.com/${new Date().getTime()}`}>Homebound</a>
      </div>
      <div>
        <a href="http://www.homebound.com" className={navLink}>
          Homebound Navlink
        </a>
      </div>
    </>
  );
};
