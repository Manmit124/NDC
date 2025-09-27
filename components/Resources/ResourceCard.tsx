"use client";

import { Resource, RESOURCE_CATEGORIES, ResourceCategory } from "@/types/database";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDeleteResource, useUpdateResource } from "@/hooks/api/useResources";
import { useState } from "react";

interface ResourceCardProps {
  resource: Resource & {
    profiles?: {
      username: string;
      full_name: string;
    };
  };
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuth();
  const deleteResource = useDeleteResource();
  const updateResource = useUpdateResource();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: resource.title,
    url: resource.url,
    description: resource.description || "",
    category: resource.category as ResourceCategory,
    tags: resource.tags || []
  });
  const [tagInput, setTagInput] = useState("");
  const [editError, setEditError] = useState("");
  
  const isOwner = user?.id === resource.submitted_by;

  const handleDelete = () => {
    deleteResource.mutate(resource.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      }
    });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !editFormData.tags.includes(tag)) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    // Validation
    if (!editFormData.title.trim()) {
      setEditError("Title is required");
      return;
    }
    if (!editFormData.url.trim()) {
      setEditError("URL is required");
      return;
    }
    if (!editFormData.category) {
      setEditError("Category is required");
      return;
    }

    // Validate URL format
    try {
      new URL(editFormData.url);
    } catch {
      setEditError("Please enter a valid URL");
      return;
    }

    updateResource.mutate(
      {
        id: resource.id,
        updates: {
          title: editFormData.title.trim(),
          url: editFormData.url.trim(),
          description: editFormData.description.trim() || undefined,
          category: editFormData.category,
          tags: editFormData.tags,
        }
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setEditError("");
        },
        onError: (err: Error) => {
          setEditError(err.message || "Failed to update resource");
        }
      }
    );
  };

  return (
    <>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
            {resource.category}
          </span>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowEditModal(true)}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                title="Edit resource"
              >
                ✏️
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-muted-foreground hover:text-red-500 text-sm transition-colors"
                title="Delete resource"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            By {resource.profiles?.full_name || "Anonymous"}
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary hover:to-primary/80 hover:text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
          >
            Visit 🔗
          </a>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">✏️ Edit Resource</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL *</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editFormData.url}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value as ResourceCategory }))}
                >
                  {RESOURCE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {editFormData.description.length}/500 characters
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Display Tags */}
                {editFormData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editFormData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary/70 hover:text-primary text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {editError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">{editError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateResource.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {updateResource.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={updateResource.isPending}
                  className="px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-foreground">Delete Resource</h3>
              <p className="text-muted-foreground">
                Are you sure you want to delete &ldquo;{resource.title}&rdquo;? This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={deleteResource.isPending}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {deleteResource.isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteResource.isPending}
                  className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
