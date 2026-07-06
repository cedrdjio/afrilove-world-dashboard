import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CircleCheck,
  EyeOff,
  Flag,
  Image as ImageIcon,
  LoaderCircle,
  LucideAngularModule,
  Search,
  TriangleAlert,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import {
  PHOTO_STATUS_LABEL,
  type PhotoItem,
  type PhotoModerationAction,
  type PhotoStatus,
} from '../../models/photo-moderation.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { PHOTOS_PAGE_SIZE, PhotosService } from './photos.service';

const DEBOUNCE_MS = 300;
const TABS: (PhotoStatus | '')[] = ['flagged', 'hidden', 'approved', ''];

/** Sprint A11 — modération des images de profil. */
@Component({
  selector: 'app-photos-page',
  imports: [LucideAngularModule, RelativeTimePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photos-page.html',
})
export class PhotosPage {
  protected readonly photos = inject(PhotosService);
  private readonly toast = inject(ToastService);

  protected readonly SearchIcon = Search;
  protected readonly ApproveIcon = CircleCheck;
  protected readonly FlagIcon = Flag;
  protected readonly HideIcon = EyeOff;
  protected readonly EmptyIcon = ImageIcon;
  protected readonly WarnIcon = TriangleAlert;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly tabs = TABS;
  protected readonly pageSize = PHOTOS_PAGE_SIZE;
  protected readonly listQuery = this.photos.listQuery;
  protected readonly result = computed(() => this.listQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / PHOTOS_PAGE_SIZE)),
  );

  protected readonly busy = signal(false);
  // Photo sur laquelle on demande confirmation de masquage (avec motif).
  protected readonly hideTarget = signal<PhotoItem | null>(null);
  protected readonly hideNote = signal('');
  // Aperçu plein écran.
  protected readonly preview = signal<PhotoItem | null>(null);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected tabLabel(status: PhotoStatus | ''): string {
    return status === '' ? 'Toutes' : PHOTO_STATUS_LABEL[status];
  }

  protected statusBadge(status: PhotoStatus): string {
    switch (status) {
      case 'approved':
        return 'bg-success/12 text-success';
      case 'flagged':
        return 'bg-warning/15 text-warning';
      case 'hidden':
        return 'bg-danger/12 text-danger';
    }
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.photos.query.set(value);
      this.photos.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected async moderate(photo: PhotoItem, action: PhotoModerationAction, note?: string): Promise<void> {
    await this.run(async () => {
      await this.photos.moderate(photo.id, action, note);
      const labels: Record<PhotoModerationAction, string> = {
        approve: 'Photo approuvée',
        flag: 'Photo signalée',
        hide: 'Photo masquée',
      };
      this.toast.success(labels[action]);
    });
  }

  protected async confirmHide(): Promise<void> {
    const photo = this.hideTarget();
    if (!photo) {
      return;
    }
    await this.moderate(photo, 'hide', this.hideNote().trim());
    this.hideTarget.set(null);
    this.hideNote.set('');
  }

  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      this.toast.error('Action impossible', error instanceof Error ? error.message : undefined);
    } finally {
      this.busy.set(false);
    }
  }
}
