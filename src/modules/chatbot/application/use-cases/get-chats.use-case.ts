import type { PaginatedResult, PaginateOptions } from "@/helpers/paginate";
import type { Chat } from "../../domain/chat.entity";
import type { IChatRepository } from "../ports/chat.repository";

interface GetChatsInput extends PaginateOptions {
  userId?: string;
}

export class GetChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: GetChatsInput): Promise<PaginatedResult<Chat>> {
    return this.chatRepository.findAll(
      { page: input.page, perPage: input.perPage },
      input.userId
    );
  }
}
