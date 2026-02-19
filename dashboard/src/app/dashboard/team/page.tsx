"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UsersRound, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, TeamMember } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function TeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [inviting, setInviting] = useState(false);
  const [removeModal, setRemoveModal] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (user && !["team", "brokerage"].includes(user.subscription_tier)) {
      router.push("/");
      return;
    }
    fetchMembers();
  }, [user, router]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await api.team.members();
    if (data) setMembers(data.members || []);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast("error", "Email required");
      return;
    }
    setInviting(true);
    const { error } = await api.team.invite({ email: inviteEmail, role: inviteRole });
    setInviting(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", `Invite sent to ${inviteEmail}`);
      setInviteModal(false);
      setInviteEmail("");
      fetchMembers();
    }
  };

  const handleRemove = async () => {
    if (!removeModal) return;
    setRemoving(true);
    const { error } = await api.team.remove(removeModal.id);
    setRemoving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Team member removed");
      setRemoveModal(null);
      fetchMembers();
    }
  };

  if (loading) return <LoadingSpinner text="Loading team..." />;

  const maxAgents = user?.subscription_tier === "brokerage" ? "Unlimited" : 10;

  return (
    <div>
      <Header
        title="Team"
        actions={
          <Button onClick={() => setInviteModal(true)}>
            <Mail className="mr-2 h-4 w-4" /> Invite Agent
          </Button>
        }
      />
      <p className="mb-6 text-sm text-gray-500">
        {members.length} of {maxAgents} agents
      </p>

      {members.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon={<UsersRound className="h-16 w-16" />}
            title="No team members yet"
            description="Invite agents to your team"
            actionLabel="Invite Agent"
            onAction={() => setInviteModal(true)}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Clients</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <Badge className={member.user_role === "team_admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}>
                        {member.user_role === "team_admin" ? "Admin" : "Agent"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.clients_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge className={member.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {member.is_active ? "Active" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setRemoveModal(member)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Invite Agent">
        <div className="space-y-4">
          <Input
            id="invite_email"
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="agent@example.com"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button loading={inviting} onClick={handleInvite}>Send Invite</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!removeModal} onClose={() => setRemoveModal(null)} title="Remove Team Member">
        <p className="text-sm text-gray-600">
          Remove <strong>{removeModal?.first_name} {removeModal?.last_name}</strong> from your team?
          Their clients will remain assigned to them.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRemoveModal(null)}>Cancel</Button>
          <Button variant="danger" loading={removing} onClick={handleRemove}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
