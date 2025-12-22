import { BaseEntity } from 'src/shared/domain/entities/base.entity'

export interface FeedbackProps {
  authorId: number
}

export class Feedback extends BaseEntity {
  private props: FeedbackProps

  get authorId() {
    return this.props.authorId
  }
}
