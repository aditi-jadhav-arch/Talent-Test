import { useState } from "react";
import { Link } from "wouter";
import { useListCandidates, useCreateCandidate, useDeleteCandidate, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, User, Trash2, Mail, Phone, Building } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CandidateList() {
  const { data: candidates, isLoading } = useListCandidates();
  const createCandidate = useCreateCandidate();
  const deleteCandidate = useDeleteCandidate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", department: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCandidate.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", department: "" });
      toast({ title: "Candidate created successfully" });
    } catch (err) {
      toast({ title: "Failed to create candidate", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await deleteCandidate.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
      toast({ title: "Candidate deleted successfully" });
    } catch (err) {
      toast({ title: "Failed to delete candidate", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage recruitment pool.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Candidate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone (Optional)</Label>
                <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Department (Optional)</Label>
                <Input value={formData.department} onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCandidate.isPending}>
                  {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading candidates...</TableCell>
              </TableRow>
            )}
            {!isLoading && candidates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No candidates found.</TableCell>
              </TableRow>
            )}
            {candidates?.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">
                  <Link href={`/candidates/${candidate.id}`} className="hover:underline flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {candidate.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm"><Mail className="w-3 h-3 mr-2 text-muted-foreground"/> {candidate.email}</div>
                    {candidate.phone && <div className="flex items-center text-sm text-muted-foreground"><Phone className="w-3 h-3 mr-2"/> {candidate.phone}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {candidate.department && <div className="flex items-center text-sm"><Building className="w-3 h-3 mr-2 text-muted-foreground"/> {candidate.department}</div>}
                </TableCell>
                <TableCell>{format(new Date(candidate.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(candidate.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
