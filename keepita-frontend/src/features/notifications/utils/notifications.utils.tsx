import { Badge, Megaphone, type LucideProps } from "lucide-react";

type getNotificationStylesReturn = {
  icon: React.ReactNode;
  shinyClassName: string;
};

type IconT = {
  icon: typeof Badge;
  className: string;
};

const icons: Record<string, IconT> = {
  announce: {
    icon: Megaphone,
    className: "text-sky-400",
  },
};

const defaultStyles: LucideProps = {
  size: 16,
  strokeWidth: 1.5,
};

export const getNotificationStyles = (
  title: "Announcement" | (string & {})
): getNotificationStylesReturn => {
  switch (title) {
    case "Announcement": {
      const iconInfo = icons["announce"];
      return {
        icon: (
          <iconInfo.icon className={iconInfo.className} {...defaultStyles} />
        ),
        shinyClassName: "bg-sky-700/40",
      };
    }
    default: {
      return {
        icon: <Badge className="text-sky-100" {...defaultStyles} />,
        shinyClassName: "bg-white/40",
      };
    }
  }
};
