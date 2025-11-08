import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Trash2, Plus, Edit } from "lucide-react";
import type { Announcement, InsertAnnouncement } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";

function AnnouncementsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertAnnouncement>({
    message: "",
    enabled: true,
    link_url: "",
    link_text: "",
  });

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertAnnouncement) =>
      apiRequest("/api/admin/announcements", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Announcement created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create announcement", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertAnnouncement> }) =>
      apiRequest(`/api/admin/announcements/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Announcement updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update announcement", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/announcements/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
      toast({ title: "Announcement deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete announcement", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      message: "",
      enabled: true,
      link_url: "",
      link_text: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      message: announcement.message,
      enabled: announcement.enabled,
      link_url: announcement.link_url || "",
      link_text: announcement.link_text || "",
    });
    setEditingId(announcement.id);
    setIsEditing(true);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="heading-announcements">
              Announcements
            </h1>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              data-testid="button-add-announcement"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingId ? "Edit Announcement" : "Create New Announcement"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Input
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Enter announcement message..."
                        required
                        data-testid="input-announcement-message"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enabled"
                        checked={formData.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, enabled: checked })
                        }
                        data-testid="switch-announcement-enabled"
                      />
                      <Label htmlFor="enabled">Enable announcement</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="link_text">Link Text (optional)</Label>
                        <Input
                          id="link_text"
                          value={formData.link_text}
                          onChange={(e) =>
                            setFormData({ ...formData, link_text: e.target.value })
                          }
                          placeholder="e.g., Shop Now"
                          data-testid="input-announcement-link-text"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="link_url">Link URL (optional)</Label>
                        <Input
                          id="link_url"
                          value={formData.link_url}
                          onChange={(e) =>
                            setFormData({ ...formData, link_url: e.target.value })
                          }
                          placeholder="https://..."
                          data-testid="input-announcement-link-url"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        data-testid="button-submit-announcement"
                      >
                        {editingId ? "Update" : "Create"} Announcement
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        data-testid="button-cancel-announcement"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No announcements yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start justify-between p-4 border rounded-md"
                    data-testid={`announcement-${announcement.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{announcement.message}</p>
                        {announcement.enabled && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      {announcement.link_url && announcement.link_text && (
                        <p className="text-sm text-muted-foreground">
                          Link: {announcement.link_text} → {announcement.link_url}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(announcement)}
                        data-testid={`button-edit-${announcement.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(announcement.id)}
                        data-testid={`button-delete-${announcement.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

export default function Announcements() {
  return (
    <AdminRoute>
      <AnnouncementsPage />
    </AdminRoute>
  );
}
