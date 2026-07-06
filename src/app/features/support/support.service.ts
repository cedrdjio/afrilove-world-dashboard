import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { Json } from '../../models/database.types';

export const TICKETS_PAGE_SIZE = 20;
export type TicketStatus = 'open' | 'pending' | 'closed';

export interface TicketMember {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export interface TicketListItem {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  updated_at: string;
  message_count: number;
  assignee_name: string | null;
  assigned_to: string | null;
  member: TicketMember;
}

export interface TicketMessage {
  id: string;
  body: string;
  is_internal: boolean;
  is_from_member: boolean;
  created_at: string;
  author_name: string;
}

export interface TicketDetail {
  ticket: Omit<TicketListItem, 'message_count' | 'member'> & { member: TicketMember };
  messages: TicketMessage[];
}

export interface TicketListResult {
  total: number;
  counts: Partial<Record<TicketStatus, number>>;
  items: TicketListItem[];
}

/** Sprint A12 — tickets de support. */
@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly status = signal<TicketStatus>('open');
  readonly query = signal('');
  readonly page = signal(0);

  readonly listQuery = injectQuery(() => ({
    queryKey: ['admin-tickets', this.status(), this.query(), this.page()],
    queryFn: () => this.fetchList(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (p: TicketListResult | undefined) => p,
  }));

  setStatus(status: TicketStatus): void {
    this.status.set(status);
    this.page.set(0);
  }

  async fetchTicket(id: string): Promise<TicketDetail> {
    const { data, error } = await this.supabase.rpc('admin_get_ticket', { p_ticket_id: id });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as TicketDetail;
  }

  async reply(ticketId: string, body: string, internal: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('admin_reply_ticket', {
      p_ticket_id: ticketId,
      p_body: body,
      p_internal: internal,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  async update(ticketId: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_update_ticket', {
      p_ticket_id: ticketId,
      p_patch: patch as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
  }

  private async fetchList(): Promise<TicketListResult> {
    const { data, error } = await this.supabase.rpc('admin_list_tickets', {
      p_status: this.status(),
      p_query: this.query() || undefined,
      p_limit: TICKETS_PAGE_SIZE,
      p_offset: this.page() * TICKETS_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as TicketListResult;
  }
}
