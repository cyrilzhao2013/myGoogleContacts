import { BaseModule } from "@/modules/base.module";
import { IContact } from "../src/types/contact.type";
import * as ContactAPI from "./api/contact.api";
import { IPaginationReq } from "@/types/pagination.type";

export class Contact extends BaseModule<IContact, never> {
  getName() {
    return this.get("firstName") + this.get("lastName");
  }

  async deleteContact() {
    await ContactAPI.deleteContact({ resourceName: this.get("resourceName") });
  }

  static async searchContacts(params: { keyword: string } & IPaginationReq) {
    const resp = await ContactAPI.searchContacts(params);

    return {
      ...resp,
      results: resp.results.map((item) => new Contact(item)),
    };
  }

  static async getContactsByResourceNames(
    resourceNames: string[]
  ): Promise<Contact[]> {
    const resp = await ContactAPI.getContactsByResourceNames({ resourceNames });

    return resp.map((item) => new Contact(item));
  }

  static async getContacts(params?: IPaginationReq) {
    const resp = await ContactAPI.getContacts(params);

    return {
      ...resp,
      results: resp.results.map((item) => new Contact(item)),
    };
  }
}
