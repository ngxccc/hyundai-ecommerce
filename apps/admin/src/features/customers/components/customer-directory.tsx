"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  ShieldAlert,
  User,
  Briefcase,
  Edit2,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nhatnang/ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@nhatnang/ui/components/ui/tabs";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import { updateCustomerTierAction } from "../actions/customer.actions";
import { type TUser, type TDealerTier } from "@nhatnang/database/schemas";

interface UserWithTier extends TUser {
  tier?: TDealerTier | null;
}

interface CustomerDirectoryProps {
  initialUsers: UserWithTier[];
  dealerTiers: TDealerTier[];
}

type TabType = "all" | "dealer" | "contractor" | "distributor" | "end_user";

export const CustomerDirectory = ({
  initialUsers,
  dealerTiers,
}: CustomerDirectoryProps) => {
  const t = useTranslations("AdminCustomers");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<UserWithTier | null>(null);
  const [businessType, setBusinessType] = useState<
    "dealer" | "contractor" | "end_user" | "distributor"
  >("end_user");
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  // Compute stats/counts
  const counts = {
    all: initialUsers.length,
    dealer: initialUsers.filter((u) => u.businessType === "dealer").length,
    contractor: initialUsers.filter((u) => u.businessType === "contractor")
      .length,
    distributor: initialUsers.filter((u) => u.businessType === "distributor")
      .length,
    end_user: initialUsers.filter((u) => u.businessType === "end_user").length,
  };

  // Filter users based on tab and search query
  const filteredUsers = initialUsers.filter((user) => {
    const matchesTab = activeTab === "all" || user.businessType === activeTab;

    const searchString =
      `${user.name} ${user.email} ${user.phone ?? ""} ${user.companyName ?? ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleOpenPromoteDialog = (user: UserWithTier) => {
    setSelectedUser(user);
    setBusinessType(user.businessType);
    setSelectedTierId(user.dealerTierId);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const response = await updateCustomerTierAction(selectedUser.id, {
        businessType,
        dealerTierId: businessType === "dealer" ? selectedTierId : null,
      });

      if (response.success) {
        toast.success(t("messages.successUpdate"));
        router.refresh();
        handleCloseDialog();
      } else {
        toast.error(response.error ?? t("messages.errorUpdate"));
      }
    });
  };

  // Business Type Badges
  const renderBusinessTypeBadge = (type: TUser["businessType"]) => {
    const styles = {
      dealer: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      contractor:
        "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      distributor:
        "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      end_user: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
    };

    const labels = {
      dealer: t("tabs.dealer"),
      contractor: t("tabs.contractor"),
      distributor: t("tabs.distributor"),
      end_user: t("tabs.end_user"),
    };

    return (
      <Badge variant="outline" className={styles[type]}>
        {labels[type]}
      </Badge>
    );
  };

  // Role Badges
  const renderRoleBadge = (role: TUser["role"]) => {
    if (
      role === "super_admin" ||
      role === "sales_representative" ||
      role === "accountant" ||
      role === "warehouse_manager"
    ) {
      return (
        <Badge
          variant="destructive"
          className="flex w-fit items-center gap-1 text-xs"
        >
          <ShieldAlert className="h-3 w-3" />
          {t("roles.admin")}
        </Badge>
      );
    }
    if (role === "dealer_approver" || role === "dealer_purchaser") {
      return (
        <Badge
          variant="default"
          className="flex w-fit items-center gap-1 border-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
        >
          <Briefcase className="h-3 w-3" />
          {t("roles.dealer")}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="flex w-fit items-center gap-1 text-xs"
      >
        <User className="h-3 w-3" />
        {t("roles.customer")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Tabs Bento Section */}
      <Card className="border-muted bg-card/60 py-0 shadow-sm backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:items-center lg:justify-between">
            <div className="relative w-full flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full pl-9"
              />
            </div>
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as TabType)}
              className="w-full"
            >
              {/* Horizontal Scrollable Tabs on Mobile/Tablet, standard wrap on larger screens */}
              <TabsList className="bg-muted/50 flex w-full snap-x scrollbar-none justify-start overflow-x-auto p-1 whitespace-nowrap lg:justify-center">
                <TabsTrigger
                  value="all"
                  className="snap-align-start shrink-0 px-4 py-2 text-xs font-semibold"
                >
                  {t("tabs.all")} ({counts.all})
                </TabsTrigger>
                <TabsTrigger
                  value="dealer"
                  className="snap-align-start shrink-0 px-4 py-2 text-xs font-semibold"
                >
                  {t("tabs.dealer")} ({counts.dealer})
                </TabsTrigger>
                <TabsTrigger
                  value="contractor"
                  className="snap-align-start shrink-0 px-4 py-2 text-xs font-semibold"
                >
                  {t("tabs.contractor")} ({counts.contractor})
                </TabsTrigger>
                <TabsTrigger
                  value="distributor"
                  className="snap-align-start shrink-0 px-4 py-2 text-xs font-semibold"
                >
                  {t("tabs.distributor")} ({counts.distributor})
                </TabsTrigger>
                <TabsTrigger
                  value="end_user"
                  className="snap-align-start shrink-0 px-4 py-2 text-xs font-semibold"
                >
                  {t("tabs.end_user")} ({counts.end_user})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Main Customers List Grid - Desktop view */}
      <Card className="border-muted bg-card hidden overflow-hidden py-0 shadow-sm md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.name")}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.contact")}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.company")}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.type")}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.tier")}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t("table.role")}
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="py-4 font-medium text-slate-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          {user.email}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {user.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-slate-600">
                      {user.companyName ?? (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {renderBusinessTypeBadge(user.businessType)}
                    </TableCell>
                    <TableCell className="py-4">
                      {user.businessType === "dealer" && user.tier ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-emerald-600">
                            {user.tier.nameVi}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {t("table.discountLabel", {
                              percent: parseFloat(
                                user.tier.discountPercentage,
                              ).toFixed(0),
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {renderRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPromoteDialog(user)}
                        className="hover:text-primary ml-auto flex items-center gap-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>{t("actions.promote")}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground h-32 text-center"
                  >
                    {t("empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Responsive Bento Card Grid - Mobile/Tablet view */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="border-muted bg-card py-0 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col justify-between space-y-4 p-4 sm:p-5">
                {/* Header: Name and badges */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-base leading-tight font-bold text-slate-900">
                      {user.name}
                    </h3>
                    {user.companyName && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.companyName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {renderRoleBadge(user.role)}
                    {renderBusinessTypeBadge(user.businessType)}
                  </div>
                </div>

                {/* Details: Contact info & Corporate status */}
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.businessType === "dealer" && user.tier && (
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-500/10 bg-emerald-50/50 p-2.5">
                      <span className="text-xs font-bold text-emerald-800">
                        {t("card.assignedTier")}
                      </span>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-emerald-600">
                          {user.tier.nameVi}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-500">
                          {t("table.discountLabel", {
                            percent: parseFloat(
                              user.tier.discountPercentage,
                            ).toFixed(0),
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPromoteDialog(user)}
                  className="hover:text-primary mt-2 flex w-full items-center justify-center gap-1.5 border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>{t("actions.promote")}</span>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-card border-muted text-muted-foreground col-span-full flex h-32 items-center justify-center rounded-lg border text-sm shadow-sm">
            {t("empty")}
          </div>
        )}
      </div>

      {/* Promotion & Tier Dialog */}
      <Dialog
        open={selectedUser !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="mx-auto w-[95%] max-w-125 rounded-xl border bg-white p-5 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Briefcase className="text-primary h-5 w-5" />
              {t("dialog.title")}
            </DialogTitle>
            <DialogDescription className="pt-1 text-slate-500">
              {t("dialog.description")}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 text-left">
              {/* User Overview */}
              <div className="rounded-lg border bg-slate-50 p-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {selectedUser.name}
                </h4>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span className="max-w-45 truncate sm:max-w-none">
                    {selectedUser.email}
                  </span>
                  <span>•</span>
                  <span>{selectedUser.phone}</span>
                </div>
              </div>

              {/* Business Type selector */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  {t("dialog.businessTypeLabel")}
                </p>
                <Select
                  value={businessType}
                  onValueChange={(val: typeof businessType) =>
                    setBusinessType(val)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="bg-background w-full border border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border bg-white shadow-md">
                    <SelectItem value="end_user">
                      {t("tabs.end_user")}
                    </SelectItem>
                    <SelectItem value="contractor">
                      {t("tabs.contractor")}
                    </SelectItem>
                    <SelectItem value="distributor">
                      {t("tabs.distributor")}
                    </SelectItem>
                    <SelectItem value="dealer">{t("tabs.dealer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dealer Tiers discount selection - only visible when business type is Dealer */}
              {businessType === "dealer" && (
                <div className="animate-in fade-in slide-in-from-top-1 space-y-2 duration-200">
                  <label className="text-sm font-bold text-slate-700">
                    {t("dialog.dealerTierLabel")}
                  </label>
                  <Select
                    value={selectedTierId ?? "none"}
                    onValueChange={(val) =>
                      setSelectedTierId(val === "none" ? null : val)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="bg-background w-full border border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border bg-white shadow-md">
                      <SelectItem value="none">{t("dialog.none")}</SelectItem>
                      {dealerTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.nameVi} (-
                          {parseFloat(tier.discountPercentage).toFixed(0)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isPending}
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 sm:w-auto"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isPending}
              className="bg-primary hover:bg-primary/95 flex w-full items-center justify-center gap-1.5 text-white shadow-sm sm:ml-auto sm:w-auto"
            >
              {isPending ? t("actions.saving") : t("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
