"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Image as ImageIcon, FileArchive, File as FileIcon, Trash2 } from "lucide-react";
import { documentService } from "@/services/document.service";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

function getFileIcon(link: string) {
  if (!link) return <FileIcon className="h-4 w-4 inline-block mr-1" />;
  const ext = link.split('.').pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext!)) return <ImageIcon className="h-4 w-4 inline-block mr-1 text-blue-500" />;
  if (["pdf"].includes(ext!)) return <FileArchive className="h-4 w-4 inline-block mr-1 text-red-500" />;
  if (["doc", "docx"].includes(ext!)) return <FileText className="h-4 w-4 inline-block mr-1 text-indigo-500" />;
  return <FileIcon className="h-4 w-4 inline-block mr-1" />;
}

function formatFileSize(size: number | undefined) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) fetchDocuments();
    // eslint-disable-next-line
  }, [user?.id]);

  async function fetchDocuments() {
    setLoading(true);
    setError("");
    try {
      if(!user) return;
      const docs = await documentService.getUserDocuments(user.id);
      setDocuments(docs);
    } catch (e) {
      setError("Failed to fetch documents");
      toast({ title: "Error", description: "Failed to fetch documents", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!label || !file) return setError("Label and file are required");
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      if(!user) return;
      formData.append("userId", user.id);
      formData.append("docLabel", label);
      if (description) formData.append("description", description);
      formData.append("file", file);
      await documentService.uploadDocument(formData);
      setLabel("");
      setDescription("");
      setFile(null);
      toast({ title: "Success", description: "Document uploaded successfully!" });
      fetchDocuments();
    } catch (e) {
      setError("Upload failed");
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDeletingId(docId);
    try {
      await documentService.deleteDocument(docId);
      toast({ title: 'Deleted', description: 'Document deleted.' });
      fetchDocuments();
    } catch (e) {
      toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading documents...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="mb-2">No documents uploaded yet.</div>
                <span className="text-xs">Upload your first document below.</span>
              </div>
            ) : (
              <table className="w-full text-sm border rounded overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Type/Label</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">File</th>
                    <th className="p-2 text-left">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-accent transition-colors">
                      <td className="p-2">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="p-2">{getFileIcon(doc.link)}{doc.docLabel}</td>
                      <td className="p-2">{doc.description || "-"}</td>
                      <td className="p-2">{formatFileSize(doc.size)}</td>
                      <td className="p-2">
                        <a href={doc.link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleUpload}>
            <div>
              <label className="block mb-1 font-medium">Type/Label *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={label}
                onChange={e => setLabel(e.target.value)}
                required
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">File *</label>
              <input
                type="file"
                className="w-full"
                onChange={e => setFile(e.target.files?.[0] || null)}
                required
                disabled={uploading}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? (
                <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</span>
              ) : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 