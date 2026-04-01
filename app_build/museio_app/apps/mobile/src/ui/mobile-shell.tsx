import { router, usePathname, type Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChartColumnBig,
  ChevronRight,
  CircleUserRound,
  Globe2,
  Home,
  Image,
  LogOut,
  MessageSquareMore,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  TextCursorInput,
  X,
  Users
} from "lucide-react-native";
import type { PropsWithChildren, ReactNode } from "react";
import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { tokens } from "@museio/ui";
import { MuseioBrandLockup } from "../brand/museio-brand-lockup";
import { useAuth } from "../auth/auth-context";

type MainTabKey = "home" | "jobs" | "portfolio" | "finance" | "more";
type SectionTone = "default" | "accent" | "dark" | "success" | "warning";

type NavItem = {
  key: MainTabKey;
  label: string;
  href: Href;
  icon: LucideIcon;
};

type MoreItem = {
  label: string;
  subtitle: string;
  href: Href;
  icon: LucideIcon;
};

const mainTabs: NavItem[] = [
  { key: "home", label: "Home", href: "/app", icon: Home },
  { key: "jobs", label: "Jobs", href: "/app/jobs", icon: Briefcase },
  { key: "portfolio", label: "Portfolio", href: "/app/portfolio", icon: Image },
  { key: "finance", label: "Finance", href: "/app/finance", icon: ChartColumnBig },
  { key: "more", label: "More", href: "/app/settings", icon: MoreHorizontal }
];

const moreItems: MoreItem[] = [
  {
    label: "Clients",
    subtitle: "Manage your client CRM",
    href: "/app/clients",
    icon: Users
  },
  {
    label: "Messages",
    subtitle: "Conversations with clients",
    href: "/app/messages",
    icon: MessageSquareMore
  },
  {
    label: "My Availability",
    subtitle: "Set your working hours",
    href: "/app/availability",
    icon: CalendarDays
  },
  {
    label: "Connected Calendars",
    subtitle: "Google Calendar & Calendly sync",
    href: "/app/connected-calendars",
    icon: Globe2
  },
  {
    label: "Tax Centre",
    subtitle: "GST, BAS and ATO reporting",
    href: "/app/tax-centre",
    icon: ShieldCheck
  },
  {
    label: "Settings",
    subtitle: "Account and preferences",
    href: "/app/settings",
    icon: Settings
  }
];

export function formatMoney(amountMinor: number, currencyCode = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amountMinor / 100);
}

export function formatDateLabel(value?: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatDateTimeLabel(value?: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatSlotRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
  const timeFormatter = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formatter.format(new Date(startsAt))} - ${timeFormatter.format(new Date(endsAt))}`;
}

export function formatRelativeCount(
  value: number,
  singular: string,
  plural = `${singular}s`
) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function statusTone(
  status: string
): "neutral" | "success" | "warning" | "danger" | "accent" {
  if (
    status === "public" ||
    status === "accepted" ||
    status === "connected" ||
    status === "ready" ||
    status === "paid" ||
    status === "succeeded" ||
    status === "confirmed" ||
    status === "complete"
  ) {
    return "success";
  }

  if (
    status === "overdue" ||
    status === "declined" ||
    status === "failed" ||
    status === "private" ||
    status === "sync-error" ||
    status === "archived"
  ) {
    return "danger";
  }

  if (
    status === "submitted" ||
    status === "under-review" ||
    status === "draft" ||
    status === "viewed" ||
    status === "deposit-requested" ||
    status === "requires-onboarding" ||
    status === "processing" ||
    status === "pending" ||
    status === "incomplete"
  ) {
    return "warning";
  }

  if (
    status === "quoted" ||
    status === "quote-prep" ||
    status === "balance-due" ||
    status === "open" ||
    status === "idle" ||
    status === "synced" ||
    status === "sent"
  ) {
    return "accent";
  }

  return "neutral";
}

function resolveActiveTab(pathname: string): MainTabKey {
  if (pathname === "/app" || pathname === "/app/") {
    return "home";
  }

  if (pathname.startsWith("/app/jobs") || pathname.startsWith("/app/bookings")) {
    return "jobs";
  }

  if (pathname.startsWith("/app/portfolio")) {
    return "portfolio";
  }

  if (
    pathname.startsWith("/app/finance") ||
    pathname.startsWith("/app/tax-centre")
  ) {
    return "finance";
  }

  return "more";
}

function SectionSurface({
  children,
  tone = "default",
  style
}: PropsWithChildren<{ tone?: SectionTone; style?: ViewStyle }>) {
  return (
    <View
      style={[
        styles.sectionSurface,
        tone === "accent" && styles.sectionSurfaceAccent,
        tone === "dark" && styles.sectionSurfaceDark,
        tone === "success" && styles.sectionSurfaceSuccess,
        tone === "warning" && styles.sectionSurfaceWarning,
        style
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.44)",
          tone === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)"
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[
          styles.sectionSurfaceSheen,
          tone === "dark" && styles.sectionSurfaceSheenDark
        ]}
      />
      {children}
    </View>
  );
}

export function AppScaffold({
  children,
  title,
  subtitle,
  topAction,
  brand = false,
  icon,
  scroll = true,
  showBottomNav = true,
  showProfileButton = false,
  activeTab,
  contentContainerStyle
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  topAction?: ReactNode;
  brand?: boolean;
  icon?: LucideIcon;
  scroll?: boolean;
  showBottomNav?: boolean;
  showProfileButton?: boolean;
  activeTab?: MainTabKey;
  contentContainerStyle?: ViewStyle;
}>) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const resolvedTab = activeTab ?? resolveActiveTab(pathname);
  const content = (
    <View
      style={[
        styles.contentContainer,
        showBottomNav && styles.contentContainerWithTabs,
        contentContainerStyle
      ]}
    >
      <TopBar
        brand={brand}
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={topAction}
        showProfileButton={showProfileButton}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlassBackdrop />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {showBottomNav ? (
        <>
          <BottomTabBar activeTab={resolvedTab} onOpenMore={() => setIsMoreOpen(true)} />
          <MoreSheet open={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
        </>
      ) : null}
      {showProfileButton ? (
        <ProfileMenu open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

export function DetailScaffold({
  children,
  title,
  subtitle,
  backHref,
  action,
  scroll = true,
  showProfileButton = false
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  backHref: Href;
  action?: ReactNode;
  scroll?: boolean;
  showProfileButton?: boolean;
}>) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const content = (
    <View style={[styles.contentContainer, styles.contentContainerWithTabs]}>
      <View style={styles.detailHeader}>
        <Pressable style={styles.backButton} onPress={() => router.push(backHref)}>
          <ArrowLeft color={tokens.color.text} size={18} strokeWidth={2.3} />
        </Pressable>
        <View style={styles.detailHeaderText}>
          <Text style={styles.detailTitle}>{title}</Text>
          {subtitle ? <Text style={styles.detailSubtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.topBarActions}>
          {action}
          {showProfileButton ? <ProfileButton onPress={() => setIsProfileOpen(true)} /> : null}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlassBackdrop />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {showProfileButton ? (
        <ProfileMenu open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}

function TopBar({
  brand,
  title,
  subtitle,
  icon,
  action,
  showProfileButton,
  onOpenProfile
}: {
  brand: boolean;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  showProfileButton: boolean;
  onOpenProfile: () => void;
}) {
  const Icon = icon;

  return (
    <View style={styles.topBar}>
      <View style={styles.topBarTitleWrap}>
        {brand ? (
          <MuseioBrandLockup subtitle={undefined} compact />
        ) : Icon ? (
          <View style={styles.headerIconWrap}>
            <Icon color={tokens.color.accent} size={20} strokeWidth={2.3} />
          </View>
        ) : null}

        <View style={styles.topBarText}>
          {title ? <Text style={styles.topBarTitle}>{title}</Text> : null}
          {subtitle ? <Text style={styles.topBarSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.topBarActions}>
        {action}
        {showProfileButton ? <ProfileButton onPress={onOpenProfile} /> : null}
      </View>
    </View>
  );
}

function GlassBackdrop() {
  return (
    <>
      <LinearGradient
        colors={["#F9FBFF", "#F4F0FF", "#EFF4FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <View style={styles.backgroundOrbPrimary} />
      <View style={styles.backgroundOrbSecondary} />
      <View style={styles.backgroundOrbTertiary} />
    </>
  );
}

function ProfileButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.profileButton} onPress={onPress}>
      <LinearGradient
        colors={["rgba(255,255,255,0.96)", "rgba(241,237,255,0.9)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.profileButtonSheen} pointerEvents="none" />
      <View style={styles.profileButtonInner}>
        <View style={styles.profileButtonIconWrap}>
          <CircleUserRound color={tokens.color.accent} size={18} strokeWidth={2.2} />
        </View>
      </View>
    </Pressable>
  );
}

function ProfileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    onClose();
    await signOut();
    router.replace("/sign-in");
  }

  return (
    <Modal animationType="fade" transparent visible={open} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.profileMenuWrap}>
          <View style={styles.profileMenuCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.96)", "rgba(241,236,255,0.88)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.profileMenuGlow} pointerEvents="none" />
            <View style={styles.profileMenuHeader}>
              <View style={styles.profileMenuAvatar}>
                <CircleUserRound color={tokens.color.accent} size={24} strokeWidth={2.2} />
              </View>
              <View style={styles.profileMenuIdentity}>
                <Text style={styles.profileMenuName}>
                  {user?.profile.displayName ?? "Museio creator"}
                </Text>
                <Text style={styles.profileMenuEmail}>{user?.email ?? "Signed in"}</Text>
              </View>
            </View>

            <View style={styles.profileMenuActions}>
              <Pressable
                style={styles.profileMenuAction}
                onPress={() => {
                  onClose();
                  router.push("/app/settings");
                }}
              >
                <View style={styles.profileMenuActionIcon}>
                  <Settings color={tokens.color.accent} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.profileMenuActionText}>
                  <Text style={styles.profileMenuActionTitle}>Settings</Text>
                  <Text style={styles.profileMenuActionSubtitle}>
                    Account, invoicing, tax and preferences
                  </Text>
                </View>
                <ChevronRight color="#A7ADC0" size={18} strokeWidth={2.2} />
              </Pressable>

              <Pressable style={styles.profileMenuAction} onPress={() => void handleSignOut()}>
                <View style={styles.profileMenuActionIconDanger}>
                  <LogOut color={tokens.color.danger} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.profileMenuActionText}>
                  <Text style={styles.profileMenuActionTitle}>Log Out</Text>
                  <Text style={styles.profileMenuActionSubtitle}>
                    Sign out of the current mobile session
                  </Text>
                </View>
                <ChevronRight color="#A7ADC0" size={18} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BottomTabBar({
  activeTab,
  onOpenMore
}: {
  activeTab: MainTabKey;
  onOpenMore: () => void;
}) {
  return (
    <View style={styles.bottomBarWrap}>
      <View style={styles.bottomBar}>
        {mainTabs.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <Pressable
              key={item.key}
              style={styles.bottomTab}
              onPress={() => {
                if (item.key === "more") {
                  onOpenMore();
                  return;
                }

                router.push(item.href);
              }}
            >
              <View style={styles.bottomTabIconWrap}>
                {isActive ? <View style={styles.bottomTabIndicator} /> : null}
                <Icon
                  color={isActive ? tokens.color.accent : "#8C92A1"}
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2.1}
                />
              </View>
              <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.moreSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>More</Text>
            <Pressable style={styles.sheetClose} onPress={onClose}>
              <X color={tokens.color.textSubtle} size={18} strokeWidth={2.3} />
            </Pressable>
          </View>

          <View style={styles.moreList}>
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.label}
                  style={styles.moreItem}
                  onPress={() => {
                    onClose();
                    router.push(item.href);
                  }}
                >
                  <View style={styles.moreItemIcon}>
                    <Icon color={tokens.color.accent} size={20} strokeWidth={2.2} />
                  </View>
                  <View style={styles.moreItemText}>
                    <Text style={styles.moreItemTitle}>{item.label}</Text>
                    <Text style={styles.moreItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight color="#C7CBD6" size={18} strokeWidth={2.4} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function HeaderActionButton({
  label,
  icon: Icon,
  onPress,
  tone = "primary"
}: {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  tone?: "primary" | "soft";
}) {
  return (
    <Pressable
      style={[styles.headerAction, tone === "soft" && styles.headerActionSoft]}
      onPress={onPress}
    >
      <LinearGradient
        colors={
          tone === "primary"
            ? ["#8E63FF", "#6E3CDE"]
            : ["rgba(255,255,255,0.94)", "rgba(244,238,253,0.84)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerActionGradient}
      />
      <View style={styles.headerActionGloss} pointerEvents="none" />
      {Icon ? <Icon color={tone === "primary" ? "#FFFFFF" : tokens.color.accent} size={14} strokeWidth={2.4} /> : null}
      <Text
        style={[
          styles.headerActionText,
          tone === "soft" && styles.headerActionTextSoft
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SearchField(props: TextInputProps) {
  return (
    <View style={styles.searchField}>
      <TextCursorInput color="#A4A9B6" size={18} strokeWidth={2.1} />
      <TextInput
        placeholderTextColor="#A4A9B6"
        style={styles.searchInput}
        {...props}
      />
    </View>
  );
}

export function SegmentedTabs<T extends string>({
  items,
  active,
  onChange
}: {
  items: Array<{ key: T; label: string; count?: number; icon?: LucideIcon }>;
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentedTabs}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;

        return (
          <Pressable
            key={item.key}
            style={[styles.segmentedTab, isActive && styles.segmentedTabActive]}
            onPress={() => onChange(item.key)}
          >
            {Icon ? (
              <Icon
                color={isActive ? "#FFFFFF" : tokens.color.textMuted}
                size={15}
                strokeWidth={2.2}
              />
            ) : null}
            <Text
              style={[
                styles.segmentedTabLabel,
                isActive && styles.segmentedTabLabelActive
              ]}
            >
              {item.label}
            </Text>
            {typeof item.count === "number" ? (
              <View
                style={[
                  styles.segmentedTabCount,
                  isActive && styles.segmentedTabCountActive
                ]}
              >
                <Text
                  style={[
                    styles.segmentedTabCountText,
                    isActive && styles.segmentedTabCountTextActive
                  ]}
                >
                  {item.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SectionCard({
  children,
  tone = "default",
  style
}: PropsWithChildren<{ tone?: SectionTone; style?: ViewStyle }>) {
  return <SectionSurface tone={tone} style={style}>{children}</SectionSurface>;
}

export function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function MetricGrid({
  items
}: {
  items: Array<{ label: string; value: string; subtitle?: string; tone?: SectionTone }>;
}) {
  return (
    <View style={styles.metricGrid}>
      {items.map((item) => (
        <MetricCard
          key={`${item.label}-${item.value}`}
          label={item.label}
          value={item.value}
          subtitle={item.subtitle}
          tone={item.tone}
        />
      ))}
    </View>
  );
}

export function MetricCard({
  label,
  value,
  subtitle,
  tone = "default"
}: {
  label: string;
  value: string;
  subtitle?: string;
  tone?: SectionTone;
}) {
  return (
    <SectionSurface tone={tone} style={styles.metricCard}>
      <Text style={[styles.metricLabel, tone === "dark" && styles.metricLabelDark]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, tone === "dark" && styles.metricValueDark]}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={[styles.metricSubtitle, tone === "dark" && styles.metricSubtitleDark]}>
          {subtitle}
        </Text>
      ) : null}
    </SectionSurface>
  );
}

export function ActionTile({
  title,
  subtitle,
  cta,
  icon: Icon,
  onPress
}: {
  title: string;
  subtitle: string;
  cta?: string;
  icon?: LucideIcon;
  onPress?: () => void;
}) {
  const inner = (
    <>
      {Icon ? (
        <View style={styles.actionTileIcon}>
          <Icon color={tokens.color.accent} size={20} strokeWidth={2.3} />
        </View>
      ) : null}
      <View style={styles.actionTileText}>
        <Text style={styles.actionTileTitle}>{title}</Text>
        <Text style={styles.actionTileSubtitle}>{subtitle}</Text>
        {cta ? <Text style={styles.actionTileCta}>{cta}</Text> : null}
      </View>
      <ChevronRight color="#CBCFDC" size={18} strokeWidth={2.4} />
    </>
  );

  return onPress ? (
    <Pressable style={styles.actionTile} onPress={onPress}>
      {inner}
    </Pressable>
  ) : (
    <View style={styles.actionTile}>{inner}</View>
  );
}

export function StatusBadge({ label }: { label: string }) {
  const tone = statusTone(label);
  const toneStyle =
    tone === "success"
      ? styles.statusBadgeSuccess
      : tone === "warning"
        ? styles.statusBadgeWarning
        : tone === "danger"
          ? styles.statusBadgeDanger
          : tone === "accent"
            ? styles.statusBadgeAccent
            : styles.statusBadgeNeutral;

  return (
    <View style={[styles.statusBadge, toneStyle]}>
      <Text
        style={[
          styles.statusBadgeText,
          tone === "success"
            ? styles.statusBadgeTextSuccess
            : tone === "warning"
              ? styles.statusBadgeTextWarning
              : tone === "danger"
                ? styles.statusBadgeTextDanger
                : tone === "accent"
                  ? styles.statusBadgeTextAccent
                  : undefined
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function DetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

export function ListLinkRow({
  href,
  title,
  subtitle,
  meta,
  badge
}: {
  href: Href;
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
}) {
  return (
    <Pressable style={styles.listCard} onPress={() => router.push(href)}>
      <View style={styles.listCardText}>
        <Text style={styles.listCardTitle}>{title}</Text>
        <Text style={styles.listCardSubtitle}>{subtitle}</Text>
        {meta ? <Text style={styles.listCardMeta}>{meta}</Text> : null}
      </View>
      <View style={styles.listCardAside}>
        {badge ? <StatusBadge label={badge} /> : null}
        <ChevronRight color="#CBCFDC" size={18} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

export function EmptyPanel({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow?: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <SectionSurface style={styles.emptyPanel}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action}
    </SectionSurface>
  );
}

export function StateCard({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string;
  title: string;
  body: string;
}) {
  return (
    <SectionSurface style={styles.emptyPanel}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </SectionSurface>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.headingBlock}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <SectionHeader title={title} subtitle={body} action={action} />
    </View>
  );
}

export function SurfaceCard({
  children,
  tone = "default"
}: PropsWithChildren<{ tone?: SectionTone }>) {
  return <SectionCard tone={tone}>{children}</SectionCard>;
}

export function SummaryGrid({
  items
}: {
  items: Array<{ label: string; value: string; tone?: SectionTone }>;
}) {
  return (
    <MetricGrid
      items={items.map((item) => ({
        label: item.label,
        value: item.value,
        tone: item.tone
      }))}
    />
  );
}

export function MobileScreen({
  children,
  title,
  subtitle,
  backHref,
  aside,
  showSecondaryNav
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backHref?: Href;
  aside?: ReactNode;
  showSecondaryNav?: boolean;
}>) {
  if (backHref) {
    return (
      <DetailScaffold
        backHref={backHref}
        title={title}
        subtitle={subtitle}
        action={aside}
      >
        {children}
      </DetailScaffold>
    );
  }

  return (
    <AppScaffold title={title} subtitle={subtitle} topAction={aside} showBottomNav={showSecondaryNav !== false}>
      {children}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F5FF"
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  backgroundOrbPrimary: {
    position: "absolute",
    top: -36,
    right: -28,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(132, 90, 255, 0.16)"
  },
  backgroundOrbSecondary: {
    position: "absolute",
    top: 180,
    left: -56,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.74)"
  },
  backgroundOrbTertiary: {
    position: "absolute",
    bottom: 140,
    right: -64,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: "rgba(180, 208, 255, 0.14)"
  },
  scrollContainer: {
    paddingBottom: 0
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16
  },
  contentContainerWithTabs: {
    paddingBottom: 118
  },
  topBar: {
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16
  },
  topBarTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center"
  },
  topBarText: {
    flex: 1,
    gap: 2,
    justifyContent: "center"
  },
  topBarTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: tokens.color.text
  },
  topBarSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: tokens.color.textSubtle
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerSpacer: {
    width: 40,
    height: 40
  },
  headerAction: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)"
  },
  headerActionSoft: {
    backgroundColor: "rgba(255,255,255,0.66)",
    borderColor: "rgba(255,255,255,0.8)"
  },
  headerActionGradient: {
    ...StyleSheet.absoluteFillObject
  },
  headerActionGloss: {
    position: "absolute",
    top: 1,
    left: 10,
    right: 10,
    height: 15,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.26)"
  },
  headerActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  headerActionTextSoft: {
    color: tokens.color.accent
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  profileButtonSheen: {
    position: "absolute",
    top: 1,
    left: 6,
    right: 6,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.42)"
  },
  profileButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  profileButtonIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(139,106,230,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  detailHeader: {
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center"
  },
  detailHeaderText: {
    flex: 1,
    gap: 2
  },
  detailTitle: {
    color: tokens.color.text,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "800"
  },
  detailSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 13,
    lineHeight: 18
  },
  bottomBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "transparent"
  },
  bottomBar: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    flexDirection: "row",
    paddingVertical: 8,
    shadowColor: "#1F2430",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 8
  },
  bottomTab: {
    flex: 1,
    alignItems: "center",
    gap: 4
  },
  bottomTabIconWrap: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  bottomTabIndicator: {
    position: "absolute",
    top: -8,
    width: 22,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: tokens.color.accent
  },
  bottomTabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: "#8C92A1"
  },
  bottomTabLabelActive: {
    color: tokens.color.accent
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(12,16,28,0.34)"
  },
  modalBackdropPressable: {
    flex: 1
  },
  moreSheet: {
    backgroundColor: "rgba(252,251,255,0.98)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 18,
    shadowColor: "#16152B",
    shadowOpacity: 0.14,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E2E5ED"
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sheetTitle: {
    color: tokens.color.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800"
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(246,243,255,0.98)",
    borderWidth: 1,
    borderColor: "rgba(139,106,230,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  moreList: {
    gap: 8
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12
  },
  moreItemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(244,238,253,0.82)",
    alignItems: "center",
    justifyContent: "center"
  },
  profileMenuWrap: {
    position: "absolute",
    top: 62,
    right: 16,
    left: 16,
    alignItems: "flex-end"
  },
  profileMenuCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    padding: 18,
    gap: 16,
    shadowColor: "#1A1730",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  profileMenuGlow: {
    position: "absolute",
    top: -18,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(122,66,232,0.12)"
  },
  profileMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  profileMenuAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(122,66,232,0.12)",
    borderWidth: 1,
    borderColor: "rgba(122,66,232,0.16)",
    alignItems: "center",
    justifyContent: "center"
  },
  profileMenuIdentity: {
    flex: 1,
    gap: 3
  },
  profileMenuName: {
    color: tokens.color.text,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "800"
  },
  profileMenuEmail: {
    color: tokens.color.textSubtle,
    fontSize: 13,
    lineHeight: 18
  },
  profileMenuActions: {
    gap: 10
  },
  profileMenuAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.64)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)"
  },
  profileMenuActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(244,238,253,0.92)",
    alignItems: "center",
    justifyContent: "center"
  },
  profileMenuActionIconDanger: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255,240,243,0.96)",
    alignItems: "center",
    justifyContent: "center"
  },
  profileMenuActionText: {
    flex: 1,
    gap: 2
  },
  profileMenuActionTitle: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800"
  },
  profileMenuActionSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 16
  },
  moreItemText: {
    flex: 1,
    gap: 2
  },
  moreItemTitle: {
    color: tokens.color.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "700"
  },
  moreItemSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 13,
    lineHeight: 18
  },
  searchField: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.84)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  searchInput: {
    flex: 1,
    color: tokens.color.text,
    fontSize: 15,
    paddingVertical: 0
  },
  segmentedTabs: {
    gap: 6,
    paddingBottom: 2
  },
  segmentedTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)"
  },
  segmentedTabActive: {
    backgroundColor: tokens.color.accent,
    borderColor: tokens.color.accent
  },
  segmentedTabLabel: {
    color: tokens.color.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700"
  },
  segmentedTabLabelActive: {
    color: "#FFFFFF"
  },
  segmentedTabCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 5,
    backgroundColor: tokens.color.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentedTabCountActive: {
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  segmentedTabCountText: {
    color: tokens.color.accent,
    fontSize: 10,
    fontWeight: "800"
  },
  segmentedTabCountTextActive: {
    color: "#FFFFFF"
  },
  sectionSurface: {
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    gap: 14,
    overflow: "hidden",
    shadowColor: "#231B4D",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  sectionSurfaceAccent: {
    backgroundColor: "rgba(251,248,255,0.84)",
    borderColor: "rgba(255,255,255,0.86)"
  },
  sectionSurfaceDark: {
    backgroundColor: "rgba(28,23,52,0.9)",
    borderColor: "rgba(255,255,255,0.18)"
  },
  sectionSurfaceSuccess: {
    backgroundColor: "rgba(234,248,240,0.84)",
    borderColor: "rgba(255,255,255,0.84)"
  },
  sectionSurfaceWarning: {
    backgroundColor: "rgba(255,244,228,0.86)",
    borderColor: "rgba(255,255,255,0.84)"
  },
  sectionSurfaceSheen: {
    position: "absolute",
    top: 1,
    left: 14,
    right: 14,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.34)"
  },
  sectionSurfaceSheenDark: {
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4
  },
  sectionHeaderTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800"
  },
  sectionHeaderSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 14,
    lineHeight: 20
  },
  metricGrid: {
    gap: 12
  },
  metricCard: {
    gap: 6
  },
  metricLabel: {
    color: tokens.color.textSubtle,
    fontSize: 11,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "800"
  },
  metricLabelDark: {
    color: "rgba(255,255,255,0.66)"
  },
  metricValue: {
    color: tokens.color.text,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "900"
  },
  metricValueDark: {
    color: "#FFFFFF"
  },
  metricSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 17
  },
  metricSubtitleDark: {
    color: "rgba(255,255,255,0.72)"
  },
  actionTile: {
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  actionTileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(244,238,253,0.82)",
    alignItems: "center",
    justifyContent: "center"
  },
  actionTileText: {
    flex: 1,
    gap: 4
  },
  actionTileTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  actionTileSubtitle: {
    color: tokens.color.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  actionTileCta: {
    color: tokens.color.accent,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusBadgeNeutral: {
    backgroundColor: "#F2F4F8"
  },
  statusBadgeAccent: {
    backgroundColor: "#F4EEFD"
  },
  statusBadgeSuccess: {
    backgroundColor: "#EAF8F0"
  },
  statusBadgeWarning: {
    backgroundColor: "#FFF4E4"
  },
  statusBadgeDanger: {
    backgroundColor: "#FFF0F3"
  },
  statusBadgeText: {
    color: tokens.color.textMuted,
    fontSize: 11,
    lineHeight: 13,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "800"
  },
  statusBadgeTextAccent: {
    color: tokens.color.accent
  },
  statusBadgeTextSuccess: {
    color: tokens.color.success
  },
  statusBadgeTextWarning: {
    color: tokens.color.warning
  },
  statusBadgeTextDanger: {
    color: tokens.color.danger
  },
  detailRow: {
    gap: 4
  },
  detailRowLabel: {
    color: tokens.color.textSubtle,
    fontSize: 11,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "800"
  },
  detailRowValue: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 21
  },
  listCard: {
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  listCardText: {
    flex: 1,
    gap: 3
  },
  listCardTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  listCardSubtitle: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  },
  listCardMeta: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 16
  },
  listCardAside: {
    alignItems: "flex-end",
    gap: 8
  },
  emptyPanel: {
    alignItems: "flex-start"
  },
  emptyTitle: {
    color: tokens.color.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800"
  },
  emptyBody: {
    color: tokens.color.textMuted,
    fontSize: 15,
    lineHeight: 21
  },
  headingBlock: {
    gap: 8
  },
  eyebrow: {
    color: tokens.color.accent,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1
  }
});
