import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  status: string;
  admin_notes: string | null;
  replied_at: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages", { status: statusFilter }],
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, status, notes }: { messageId: string; status: string; notes: string }) => {
      await apiRequest("PUT", `/api/admin/messages/${messageId}`, { status, admin_notes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      setSelectedMessage(null);
      setNewStatus("");
      setAdminNotes("");
      toast({
        title: "Message updated",
        description: "Message status has been updated successfully",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "read":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleUpdateMessage = () => {
    if (!selectedMessage || !newStatus) return;
    updateMessageMutation.mutate({
      messageId: selectedMessage.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Customer Messages</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Customer Messages</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Messages Found</h2>
            <p className="text-muted-foreground">
              No messages match your current filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className="hover-elevate cursor-pointer"
              onClick={() => {
                setSelectedMessage(message);
                setNewStatus(message.status);
                setAdminNotes(message.admin_notes || "");
              }}
              data-testid={`message-${message.id}`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle className="text-lg truncate">{message.subject}</CardTitle>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{message.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(message.created_at), "PPP")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-medium mb-1">From: {message.name}</p>
                <p className="text-sm line-clamp-2">{message.message}</p>
                {message.admin_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Admin Notes:</p>
                    <p className="text-sm">{message.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMessage && (
        <Dialog
          open={!!selectedMessage}
          onOpenChange={() => {
            setSelectedMessage(null);
            setNewStatus("");
            setAdminNotes("");
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                From {selectedMessage.name} ({selectedMessage.email})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedMessage.created_at), "PPP")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Type: {selectedMessage.inquiry_type}
                </p>
              </div>

              <div>
                <Label>Message</Label>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status" data-testid="select-new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  data-testid="input-admin-notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMessage(null);
                    setNewStatus("");
                    setAdminNotes("");
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={handleUpdateMessage}
                  disabled={updateMessageMutation.isPending}
                  data-testid="button-update-message"
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
