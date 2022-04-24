export default interface PatchProduct {
  id: number;
  name?: string; // max name of 50
  price?: number;
  stock?: number;
  enabled?: boolean;
  addTags?: number[]; // the list of tag ids to be added
  description?: string;
  deleteTags?: number[]; // the list of tag ids to be deleted
}
